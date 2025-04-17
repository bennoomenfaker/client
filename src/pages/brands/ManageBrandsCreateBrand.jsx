import { useState } from "react";
import { useDispatch } from "react-redux";
import { createBrand } from "../../redux/slices/brandsSlice";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box } from "@mui/material";
import { toast } from "react-toastify";
import NavBar from "../../components/NavBar";

const ManageBrandsCreateBrand = () => {
    const [brandName, setBrandName] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isNavOpen, setIsNavOpen] = useState(true);

    // Récupérer l'hôpitalId depuis sessionStorage
    const hospitalId = sessionStorage.getItem("hospitalId");

    // Gérer les changements dans le formulaire
    const handleBrandNameChange = (e) => {
        setBrandName(e.target.value);
    };

    // Soumettre le formulaire pour créer une nouvelle marque
    const handleCreateBrand = async (e) => {
        e.preventDefault();

        if (!brandName) {
            toast.warning("Le nom de la marque est requis !");
            return;
        }

        if (!hospitalId) {
            toast.error("L'ID de l'hôpital est manquant !");
            return;
        }

        try {
            // Envoi de la requête pour créer la marque avec le hospitalId et le brandName
            const brandData = {
                name: brandName,
                hospitalId: hospitalId
            };

            await dispatch(createBrand(brandData)).unwrap();

            toast.success("Marque créée avec succès !");

            // Rediriger vers la liste des marques
            navigate("/manage-brands/brands");

            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            //console.log(error);
            toast.warning("La marque existe déjà !");
        }
    };
    const handleCancel = () => {
        navigate("/manage-brands/brands");
    }

    return (
        <div style={{ display: "flex" }}>
            <NavBar onToggle={setIsNavOpen} />
            <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh", // Utiliser la hauteur totale de la vue
                        flexDirection: "column",
                    }}
                >
                    <h2>Créer une nouvelle marque</h2>
                    <form onSubmit={handleCreateBrand}>
                        <Box sx={{ display: "flex", flexDirection: "column", width: "300px" }}>
                            <TextField
                                label="Nom de la marque"
                                variant="outlined"
                                value={brandName}
                                onChange={handleBrandNameChange}
                                
                                sx={{ marginBottom: "20px" }}
                            />
                            <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>

                                <Button variant="contained" color="success" type="submit" fullWidth>
                                    Créer
                                </Button>
                                <Button onClick={handleCancel} variant="contained" color="warning" fullWidth >
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

export default ManageBrandsCreateBrand;
