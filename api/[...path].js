import { handleVercelRequest } from "../server/vercel-handler.js";

export default function handler(req, res) {
  handleVercelRequest(req, res);
}
