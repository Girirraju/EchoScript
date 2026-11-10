const audioTypes: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
}

export function audioContentType(file: Pick<File, 'name' | 'type'>) {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  return audioTypes[extension] || file.type
}
