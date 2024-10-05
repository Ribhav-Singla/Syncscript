import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useRecoilValue } from "recoil";
import { usernameState } from "@/recoil";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRecoilState } from "recoil";
import { myDocumentsState } from "@/recoil";

function Homepage() {
  const navigate = useNavigate();
  const username = useRecoilValue(usernameState);
  const [mydocuments, setMydocuments] = useRecoilState(myDocumentsState);
  const [limit, setLimit] = useState(5);
  const [refreshDocuments, setRefreshDocuments] = useState(false);
  const [documentId, setDocumentId] = useState('');

  useEffect(() => {
    const fetchMyDocuments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/mydocuments?limit=${limit}`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        setMydocuments(response.data);
      } catch (error) {
        console.log("error occured while fetching mydocuments: ", error);
      }
    };

    fetchMyDocuments();
  }, [limit,refreshDocuments]);

  const Newdocument = () => {
    if (username) navigate(`/documents/${uuidv4()}`);
    else navigate("/login");
  };

  return (
    <section className="border">
      <main className="p-2 py-5">
        <div className="flex justify-between items-center flex-wrap">
          <div
            className="h-40 w-36 p-4 text-center flex flex-col justify-center items-center rounded cursor-pointer blank-document"
            onClick={Newdocument}
          >
            <img src="/blankdoc.svg" alt="+" width={50} />
            <span className="text-gray-500 text-center">Blank document</span>
          </div>
          <div className="join-box rounded px-4 py-3 w-80 flex flex-col">
            <div>
              <label htmlFor="documentId">DocumentId</label>
              <Input
                type="text"
                placeholder="4d1613c0-f163-4fc5-a1a5-fe50ed4xxxx0"
                className="mt-1"
                value={documentId}
                onChange={(e)=>setDocumentId(e.target.value)}
              />
            </div>
            <div className="mt-5 flex justify-end">
              <Button>Join</Button>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <h1 className="text-lg pb-2 border-b-2">Recents</h1>
          <div className="p-2">
            {mydocuments.length == 0 ? (
              <p>No documents found</p>
            ) : (
              mydocuments.map(
                (obj: { filename: string; documentId: string, updatedAt: Date }) => {
                  return (
                    <Recentdocs
                      key={obj.documentId}
                      fileName={obj.filename}
                      documentId={obj.documentId}
                      updatedAt = {obj.updatedAt}
                      setRefreshDocuments={setRefreshDocuments}
                    />
                  );
                }
              )
            )}
          </div>
          <p
            className="text-blue-500 text-center cursor-pointer"
            onClick={() => setLimit(1e9)}
          >
            More...
          </p>
        </div>
      </main>
    </section>
  );
}

function Recentdocs({
  fileName,
  documentId,
  updatedAt,
  setRefreshDocuments,
}: {
  fileName: string;
  documentId: string;
  updatedAt: Date;
  setRefreshDocuments: Dispatch<SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteBtnLoader, setDeleteBtnLoader] = useState(false);

  const handleOpenDocument = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  const handleDeleteDocument = async (documentId: string) => {
    setDeleteBtnLoader(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/deleteDocument/${documentId}`,
        {},
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      setRefreshDocuments(prev => !prev);
      toast({
        title: response.data.message,
      });
    } catch (error) {
      console.log("error occured while deleting the document: ", error);
    } finally {
      setDeleteBtnLoader(false);
    }
  };

  return (
    <div className="flex justify-between items-center p-2 bg-slate-100 rounded mb-3">
      <span>{fileName}</span>
      <span className="text-gray-500">{new Date(updatedAt).toLocaleString()}</span>
      <div className="flex justify-center items-center gap-5">
        <Button
          variant={"outline"}
          onClick={() => handleOpenDocument(documentId)}
        >
          Open
        </Button>
        <Button
          variant={"destructive"}
          onClick={() => handleDeleteDocument(documentId)}
        >
          {deleteBtnLoader ? "Deleting.." : "Delete"}
        </Button>
      </div>
    </div>
  );
}

export default Homepage;
