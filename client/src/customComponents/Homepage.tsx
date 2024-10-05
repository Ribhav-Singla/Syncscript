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
import { ColorRing } from "react-loader-spinner";
import { Tooltip } from "react-tippy";

function Homepage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const username = useRecoilValue(usernameState);
  const [mydocuments, setMydocuments] = useRecoilState(myDocumentsState);
  const [limit, setLimit] = useState(5);
  const [refreshDocuments, setRefreshDocuments] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinBtnLoader, setJoinBtnLoader] = useState(false);

  useEffect(() => {
    const fetchMyDocuments = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchMyDocuments();
  }, [limit, refreshDocuments]);

  const Newdocument = () => {
    if (username) navigate(`/documents/${uuidv4()}`);
    else navigate("/login");
  };

  const handleJoin = async () => {
    if (!documentId) return;
    setJoinBtnLoader(true);
    try {
      await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/verifyDocumentId/${documentId}`,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      navigate(`/documents/${documentId}`);
    } catch (error) {
      console.log("error occured while validating the documentId: ", error);
      toast({
        //@ts-ignore
        title: error.response.data.message,
      });
    } finally {
      setJoinBtnLoader(false);
    }
  };

  return (
    <section className="border">
      <main className="p-2 py-5">
        <div className="grid grid-cols-12 py-8 px-5">
          <div
            className="col-span-12 md:col-span-2 p-4 text-center flex flex-col justify-center items-center rounded cursor-pointer blank-document"
            onClick={Newdocument}
          >
            <img src="/plus.png" alt="+" width={40} />
            <span className="text-gray-500 text-center mt-2">
              Blank document
            </span>
          </div>
          <div className="col-span-12 md:col-span-10 grid grid-cols-12 mt-5 md:mt-0 md:ms-5">
            <div className="col-span-12 sm:col-span-6 join-box rounded flex flex-col justify-start px-4 py-3 sm:me-3">
              <p className="text-red-500">Features</p>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing.</p>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing.</p>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing.</p>
            </div>
            <div className="col-span-12 sm:col-span-6 join-box rounded px-4 py-3 flex flex-col sm:ms-2 mt-5 sm:mt-0">
              <div>
                <label htmlFor="documentId">DocumentId</label>
                <Input
                  type="text"
                  placeholder="4d1613c0-f163-4fc5-a1a5-fe50ed4xxxx0"
                  className="mt-1"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                />
              </div>
              <div className="mt-5 flex justify-end">
                <Button className="w-24" onClick={handleJoin}>
                  {joinBtnLoader ? "verifying..." : "Join"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <h1 className="text-lg pb-2 border-b-2">Recents</h1>
          <div className="p-2">
            {loading ? (
              <div className="flex justify-center items-center p-10">
                <ColorRing height={50} width={80} />
              </div>
            ) : (
              <div>
                {mydocuments.length == 0 ? (
                  <p>No documents found</p>
                ) : (
                  mydocuments.map(
                    (obj: {
                      filename: string;
                      documentId: string;
                      updatedAt: Date;
                      shareable: Boolean;
                    }) => {
                      return (
                        <Recentdocs
                          key={obj.documentId}
                          fileName={obj.filename}
                          documentId={obj.documentId}
                          updatedAt={obj.updatedAt}
                          shareable={obj.shareable}
                          setRefreshDocuments={setRefreshDocuments}
                        />
                      );
                    }
                  )
                )}
              </div>
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
  shareable,
  setRefreshDocuments,
}: {
  fileName: string;
  documentId: string;
  updatedAt: Date;
  shareable: Boolean;
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
      setRefreshDocuments((prev) => !prev);
      toast({
        title: response.data.message,
      });
    } catch (error) {
      console.log("error occured while deleting the document: ", error);
    } finally {
      setDeleteBtnLoader(false);
    }
  };

  const handleShareable = async (documentId: string) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/makeShareableDocument/${documentId}`,
        {},
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      setRefreshDocuments((prev) => !prev);
    } catch (error) {
      console.log("error occured while making document shareable: ", error);
    }
  };

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
      setRefreshDocuments((prev) => !prev);
    } catch (error) {
      console.log("error occured while making document unshareable: ", error);
    }
  };

  return (
    <div className="flex flex-wrap justify-between items-center p-2 bg-slate-100 rounded mb-3">
      <span>{fileName}</span>
      <span className="text-gray-500">
        {new Date(updatedAt).toLocaleString()}
      </span>
      <div className="flex justify-center items-center gap-5 w-full mt-5 sm:mt-0 sm:w-fit">
        {shareable ? (
          <div onClick={() => handleNotShareable(documentId)}>
            <Tooltip
              title="Make not shareable"
              position="top"
              trigger="mouseenter"
              className="cursor-pointer"
            >
              <img src="/unlock.png" alt="Unlock" width={35} />
            </Tooltip>
          </div>
        ) : (
          <div onClick={() => handleShareable(documentId)}>
            <Tooltip
              title="Make shareable"
              position="top"
              trigger="mouseenter"
              className="cursor-pointer"
            >
              <img src="/lock.png" alt="Lock" width={35} />
            </Tooltip>
          </div>
        )}
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
