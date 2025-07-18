from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from search_faiss import search_faiss  
from dotenv import load_dotenv
import os

app = FastAPI()
load_dotenv()
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Allow your Next.js frontend to access this API (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/query")
async def query_endpoint(req: Request):
    body = await req.json()
    query = body.get("query")
    if not query:
        return {"results": []}
    results = search_faiss(query)
    return {"results": results}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
