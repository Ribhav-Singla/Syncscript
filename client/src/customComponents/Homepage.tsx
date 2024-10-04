import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useRecoilValue } from "recoil";
import { usernameState } from "@/recoil";

function Homepage() {
  const navigate = useNavigate();
  const username = useRecoilValue(usernameState);
  const Newdocument = () => {
    if(username)
      navigate(`/documents/${uuidv4()}`);
    else
      navigate('/login')
  };

  return (
    <section className="border">
      <main className="p-2 py-5">
        <div
          className="border-2 border-blue-500 h-40 w-36 p-4 text-center flex justify-center items-center rounded cursor-pointer"
          onClick={Newdocument}
        >
          <span className="text-gray-500 text-center">Blank document</span>
        </div>
        <div className="mt-5">
          <h1 className="text-lg pb-2 border-b-2">Recents</h1>
          <div className="p-2">
            <Recentdocs fileName="doc1" documentId="1" />
            <Recentdocs fileName="doc1" documentId="1" />
            <Recentdocs fileName="doc1" documentId="1" />
            <Recentdocs fileName="doc1" documentId="1" />
            <Recentdocs fileName="doc1" documentId="1" />
          </div>
          <p className="text-blue-500 text-center cursor-pointer">More...</p>
        </div>
      </main>
    </section>
  );
}

function Recentdocs({
  fileName,
  documentId,
}: {
  fileName: string;
  documentId: string;
}) {
  const navigate = useNavigate();
  const handleOpenDocument = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  const handleDeleteDocument = (documentId: string) => {
    console.log(documentId);
  };

  return (
    <div className="flex justify-between items-center p-2 bg-slate-100 rounded mb-3">
      <span>{fileName}</span>
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
          Delete
        </Button>
      </div>
    </div>
  );
}

export default Homepage;
