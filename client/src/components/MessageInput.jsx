import { Image, Send, X } from "lucide-react";
import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { sendMessage } from "../store/slices/chatSlice";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);

  const { selectedUser } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMedia(file);
    const fileType = file.type;

    if (fileType.startsWith("image/")) {
      setMediaType("image");
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (fileType.startsWith("video/")) {
      setMediaType("video");
      setMediaPreview(URL.createObjectURL(file));
    } else {
      toast.error("Unsupported file type. Please select an image or video.");
      setMedia(null);
      setMediaPreview(null);
      setMediaType("");
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaType("");
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !media) return;
    if (!selectedUser?._id) {
      toast.error("Select a user to send message to.");
      return;
    }

    const data = new FormData();
    if (text.trim()) data.append("text", text.trim());
    if (media) data.append("media", media);

    try {
      await dispatch(sendMessage(data)).unwrap();
      setText("");
      removeMedia();
    } catch (err) {
      console.error("sendMessage failed:", err);
      toast.error(err?.message || "Failed to send message");
    }
  };

  return (
    <div className="p-4 w-full">
      {mediaPreview && (
        <div className="mb-3 flex items-center gap-2 relative">
          {mediaType === "image" ? (
            <img
              src={mediaPreview}
              alt="media preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-700"
            />
          ) : (
            <video
              src={mediaPreview}
              className="w-20 h-20 object-cover rounded-lg border border-gray-700"
              controls
            />
          )}
          <button
            onClick={removeMedia}
            className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-black"
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleMediaChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 transition ${
              mediaPreview ? "text-emerald-500" : "text-gray-400"
            }`}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim() && !media}
          className="w-10 h-10 flex items-center justify-center bg-blue-700 text-white rounded-full px-2 py-2 hover:bg-blue-600 transition disabled:opacity-50"
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
