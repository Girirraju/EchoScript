import asyncio

import httpx


class HeyGenClient:
    def __init__(self, api_key: str, timeout_seconds: float = 30):
        self.client = httpx.AsyncClient(base_url="https://api.heygen.com", headers={"X-Api-Key": api_key, "Content-Type": "application/json"}, timeout=timeout_seconds)

    async def create_video(self, script: str, avatar_id: str, voice_id: str) -> str:
        payload = {"video_inputs": [{"character": {"type": "avatar", "avatar_id": avatar_id, "avatar_style": "normal"}, "voice": {"type": "text", "input_text": script, "voice_id": voice_id}}], "dimension": {"width": 1280, "height": 720}, "caption": True}
        response = await self.client.post("/v2/video/generate", json=payload)
        response.raise_for_status()
        video_id = response.json().get("data", {}).get("video_id")
        if not video_id:
            raise RuntimeError("HeyGen did not return a video ID")
        return video_id

    async def wait_for_video(self, video_id: str, attempts: int = 120) -> str:
        for attempt in range(attempts):
            response = await self.client.get("/v1/video_status.get", params={"video_id": video_id})
            response.raise_for_status()
            data = response.json().get("data", {})
            if data.get("status") == "completed" and data.get("video_url"):
                return data["video_url"]
            if data.get("status") == "failed":
                raise RuntimeError(data.get("error") or "HeyGen video generation failed")
            await asyncio.sleep(min(10 + attempt // 10, 30))
        raise TimeoutError("HeyGen video generation timed out")

