import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useCallback, useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const URL = `${import.meta.env.VITE_BACKEND_URL}`;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "video", "blockquote", "code-block"],
  ["clean"],
];

function Documents() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState<Socket | null>();
  const [quill, setQuill] = useState<Quill | null>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const s = io(URL, {
        auth: { token },
      });
      setSocket(s);
      s.connect();

      return () => {
        s.disconnect();
      };
    }
  }, []);


  // text-change useEffect
  useEffect(()=>{
    if(socket == null || quill == null) return;

    //@ts-ignore
    const handler = (delta,oldDelta,source)=>{
      if(source !== 'user') return;
      socket.emit('send-changes', delta)
    }
    quill.on('text-change', handler);
    return () => {
      quill.off('text-change', handler);
    }

  })

  // receive-changes useEffect
  useEffect(()=>{
    if(socket == null || quill == null) return;

    //@ts-ignore
    const handler = (delta,oldDelta,source)=>{
      if(source !== 'user') return;
      socket.emit('send-changes', delta)
    }
    quill.on('text-change', handler);
    return () => {
      quill.off('text-change', handler);
    }

  })

  const wrapperRef = useCallback((wrapper: HTMLDivElement | null) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    setQuill(q);
  }, []);

  return (
    <div>
      {/* Online Users */}
      <div className="online-users p-2 flex justify-between items-center bg-slate-50">
        <div className="max-w-56">
          <Input placeholder="File name" />
        </div>
        <div className="flex justify-center items-center gap-5">
          <div className="flex justify-center items-center gap-2">
            <User_avatar />
            <User_avatar />
            <User_avatar />
          </div>
          <div>
            <button
              className="bg-blue-200 p-2 rounded-md hover:bg-blue-300"
              onClick={() => copy(`${documentId}`)}
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Text Editor */}
      <div>
        <div className="container" ref={wrapperRef}></div>
      </div>
    </div>
  );
}

function User_avatar() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}

export default Documents;
