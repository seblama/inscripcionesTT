import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, UserPlus, Users } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="mb-8 flex justify-center gap-4">
      <Link to="/">
        <Button
          variant={location.pathname === "/" ? "default" : "outline"}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Registro
        </Button>
      </Link>
      <Link to="/table">
        <Button
          variant={location.pathname === "/table" ? "default" : "outline"}
          className="gap-2"
        >
          <Table className="h-4 w-4" />
          Ver Inscripciones
        </Button>
      </Link>
      <Link to="/coordinadores">
        <Button
          variant={location.pathname === "/coordinadores" ? "default" : "outline"}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Coordinadores
        </Button>
      </Link>
    </nav>
  );
};

export default Navigation;
