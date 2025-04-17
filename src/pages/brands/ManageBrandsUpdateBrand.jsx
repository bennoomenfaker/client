import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Button, Box } from "@mui/material";
import { fetchBrandById, updateBrand } from "../../redux/slices/brandsSlice";
import NavBar from "../../components/NavBar";
import { toast } from "react-toastify";

const ManageBrandsUpdateBrand = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const { id } = useParams(); // Récupérer l'ID de la marque
  const hospitalId = sessionStorage.getItem("hospitalId");
  const [name, setName] = useState(""); // Gérer l'état du nom de la marque
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const brand = useSelector((state) => state.brand.selectedBrand);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchBrandById(id)); // Récupérer la marque en fonction de l'ID
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (brand) {
      setName(brand.name); // Initialiser le nom de la marque récupérée
    }
  }, [brand]);

  const handleBrandNameChange = (e) => {
    setName(e.target.value); // Mettre à jour le nom de la marque
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.warning("Le nom de la marque est requis !");
      return;
    }

    try {
      // Envoi des données de mise à jour
      const brandData = { name, hospitalId };
      await dispatch(updateBrand({ id, brandData })).unwrap();

      toast.success("Marque mise à jour avec succès !");
      navigate("/manage-brands/brands"); // Rediriger vers la liste des marques
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la mise à jour de la marque.");
    }
  };

  const handleCancel = () => {
    navigate("/manage-brands/brands"); // Annuler et revenir à la liste des marques
  };

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
          }}
        >
          <h2>Modifier la marque</h2>
          <form onSubmit={handleUpdateBrand}>
            <Box sx={{ display: "flex", flexDirection: "column", width: "300px" }}>
              <TextField
                label="Nom de la marque"
                variant="outlined"
                value={name} // Utiliser la variable `name`
                onChange={handleBrandNameChange}
                sx={{ marginBottom: "20px" }}
              />
              <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
                <Button variant="contained" color="success" type="submit" fullWidth>
                  Modifier
                </Button>
                <Button onClick={handleCancel} variant="contained" color="warning" fullWidth>
                  Annuler
                </Button>
              </div>
            </Box>
          </form>
        </Box>
      </div>
    </div>
  );
};

export default ManageBrandsUpdateBrand;
