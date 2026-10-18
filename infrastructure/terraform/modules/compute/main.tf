variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "instance_type" {
  type    = string
  default = "t3.large"
}
variable "min_size" {
  type    = number
  default = 1
}
variable "desired_size" {
  type    = number
  default = 1
}
variable "max_size" {
  type    = number
  default = 3
}
variable "instance_profile_name" { type = string }
variable "user_data" {
  type      = string
  sensitive = true
}
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}
resource "aws_security_group" "node" {
  name_prefix = "${var.name}-"
  vpc_id      = var.vpc_id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_launch_template" "this" {
  name_prefix   = "${var.name}-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  iam_instance_profile { name = var.instance_profile_name }
  vpc_security_group_ids = [aws_security_group.node.id]
  user_data              = base64encode(var.user_data)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      encrypted   = true
      volume_size = 40
      volume_type = "gp3"
    }
  }
  tag_specifications {
    resource_type = "instance"
    tags          = { Name = var.name, Project = "echoscript" }
  }
}
resource "aws_autoscaling_group" "this" {
  name                    = var.name
  min_size                = var.min_size
  desired_capacity        = var.desired_size
  max_size                = var.max_size
  vpc_zone_identifier     = var.subnet_ids
  health_check_type       = "EC2"
  default_instance_warmup = 180
  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }
  tag {
    key                 = "Project"
    value               = "echoscript"
    propagate_at_launch = true
  }
  lifecycle { create_before_destroy = true }
}
output "asg_name" { value = aws_autoscaling_group.this.name }
output "security_group_id" { value = aws_security_group.node.id }

