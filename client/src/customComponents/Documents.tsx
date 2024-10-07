import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useCallback, useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { ColorRing } from "react-loader-spinner";
import { usernameState } from "@/recoil";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const URL = `${import.meta.env.VITE_BACKEND_URL}`;
const SAVE_INTERVAL_MS = 2000;
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

const handleNotShareable = async (documentId: string) => {
  try {
    await axios.post(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/makeNotShareableDocument/${documentId}`,
      {},
      {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      }
    );
  } catch (error) {
    console.log("error occured while making document unshareable: ", error);
  }
};

function Documents() {
  const navigate = useNavigate();
  const { id: documentId } = useParams();
  const username = useRecoilValue(usernameState);
  const [socket, setSocket] = useState<Socket | null>();
  const [quill, setQuill] = useState<Quill | null>();
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState("Untitled document");
  const [CopyBtn, setCopyBtn] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [documentOwner, setDocumentOwner] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const s = io(URL, {
        auth: { token },
      });
      setSocket(s);
      s.connect();
      
      s.on('disconnect',()=>{
        console.log('Disconnected from server');
      })

      return () => {
        if(documentOwner == username){          
          s.emit('close-document', documentId)
          //@ts-ignore
          handleNotShareable(documentId)
        }
        s.disconnect();
      };
    }
  }, [username,documentOwner,documentId]);

  // close-document useEffect
  useEffect(()=>{
    if(socket == null) return;
  
    const handler = ()=>{
      window.alert('The document has been closed by the owner.');
      socket.disconnect();
      navigate('/');
    }
    socket.on('close-document',handler);
    return ()=>{
      socket.off('close-document',handler);
    }
  },[socket])

  // load-document useEffect
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document, filename, editMode, documentOwner) => {
      quill.setContents(document);
      setFilename(filename);
      setEditMode(editMode);
      setDocumentOwner(documentOwner);

      if(documentOwner == username){
        quill.enable();
      }else{
        if(editMode){
          quill.enable()
        }else{
          quill.disable()
        }
      }
    });

    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  // save-document useEffect
  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(async () => {
      setLoading(true);
      socket.emit("save-document", quill.getContents(), filename);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoading(false);
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill, filename]);

  // text-change useEffect
  useEffect(() => {
    if (socket == null || quill == null) return;

    //@ts-ignore
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  });

  // receive-changes useEffect
  useEffect(() => {
    if (socket == null || quill == null) return;

    //@ts-ignore
    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  });

  // onlineUsers useEffect
  useEffect(() => {
    if (!socket) return;
    //@ts-ignore
    const handler = (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    };
    socket.on("load-onlineUsers", handler);

    return () => {
      socket.off("load-onlineUsers", handler);
    };
  }, [socket, documentId]);

  // edit, view useEffect
  useEffect(() => {
    if (socket == null) return;

    const handler = (editMode: boolean) => {
      if (!editMode) {
        quill?.disable();
      } else {
        quill?.enable();
      }
    };

    socket.emit("send-toggleEditMode");
    socket.on("load-toggleEditMode", handler);
    return () => {
      socket.off("load-toggleEditMode", handler);
    };
  }, [socket, quill, editMode, documentId]);

  const wrapperRef = useCallback((wrapper: HTMLDivElement | null) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });

    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  return (
    <div>
      <div className="online-users p-2 flex justify-between items-center bg-slate-50">
        {/* filename input box */}
        <div className="max-w-60 flex justify-between items-center gap-2">
          <Input
            placeholder="File name"
            className="max-w-44"
            value={filename}
            maxLength={25}
            onChange={(e) => {
              if(documentOwner == username){
                setFilename(e.target.value);
              }
            }}
          />
          {loading ? <ColorRing height={"40"} /> : ""}
        </div>

        <div className="flex justify-center items-center gap-5">
          {/* Online Users Avatars */}
          <div className="flex justify-center items-center gap-2">
            {onlineUsers.map((item, index) => {
              return <User_avatar key={index} username={item} />;
            })}
          </div>
          {/* Edit, View, Share Btns */}
          <div className="justify-center items-center gap-3 hidden sm:flex">
            {username == documentOwner ? (
              <button
                className={`p-2 px-1 rounded-md hover:bg-green-300 w-20 bg-green-200 ${
                  editMode ? "" : `bg-red-200 hover:bg-red-300`
                }`}
                onClick={() => setEditMode((prev) => !prev)}
              >
                Edit
              </button>
            ) : (
              ""
            )}
            <button
              className={`p-2 px-1 rounded-md hover:bg-blue-300 w-20 bg-blue-200 ${
                CopyBtn ? `bg-green-200 hover:bg-green-300` : ""
              }`}
              onClick={() => {
                copy(`${documentId}`);
                setCopyBtn(true);
                setTimeout(() => {
                  setCopyBtn(false);
                }, 1000);
              }}
            >
              {CopyBtn ? "Copied" : "Share ID"}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center gap-5 my-2 sm:hidden">
        <button
          className={`p-2 px-1 rounded-md hover:bg-green-300 w-20 bg-green-200 ${
            editMode ? "" : `bg-red-200 hover:bg-red-300`
          }`}
          onClick={() => setEditMode((prev) => !prev)}
        >
          Edit
        </button>
        <button
          className={`p-2 px-1 rounded-md hover:bg-blue-300 w-20 bg-blue-200 ${
            CopyBtn ? `bg-green-200 hover:bg-green-300` : ""
          }`}
          onClick={() => {
            copy(`${documentId}`);
            setCopyBtn(true);
            setTimeout(() => {
              setCopyBtn(false);
            }, 1000);
          }}
        >
          {CopyBtn ? "Copied" : "Share ID"}
        </button>
      </div>

      {/* Text Editor */}
      <div className="flex justify-center items-center">
        <div className="container" ref={wrapperRef}></div>
      </div>
    </div>
  );
}

function User_avatar({ username }: { username: string }) {
  return (
    <Avatar className="">
      <AvatarImage src="/" />
      <AvatarFallback>
        {username.toUpperCase()[0] + username.toUpperCase()[1]}
      </AvatarFallback>
    </Avatar>
  );
}

export default Documents;
