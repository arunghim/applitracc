import { useEffect } from "react";
import Appbar from "../../components/Appbar";
import "./HomePage.css";

function HomePage() {
  useEffect(() => {
    document.title = "Applitrack";
  }, []);

  return (
    <div className="hp">
      <Appbar />
    </div>
  );
}

export default HomePage;
