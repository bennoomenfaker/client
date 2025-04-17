import NavBar from "../../components/NavBar";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById, modifyUser } from '../../redux/slices/userSlice';
import { Container, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FaUser } from 'react-icons/fa';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { toast } from 'react-toastify';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ManageUserUpdateUser = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userInfo);

  const [userDataToUpdate, setUserDataToUpdate] = useState({
    lastName: '',
    firstName: '',
    email: '',
    telephone: '',
    role: null,
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await dispatch(getUserById(id));
        setUserDataToUpdate(user.payload);
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération de l'utilisateur :", error);
      }
    };
    fetchUserData();
  }, [dispatch, id]);

  useEffect(() => {
    if (user) {
      setUserDataToUpdate({
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDataToUpdate(prevUserData => ({
      ...prevUserData,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {

      let userData = { ...userDataToUpdate };
      

      // Vérifier si un nouveau mot de passe est saisi
      if (password && password === confirmPassword && password.length >= 6) {
        userData = { ...userData, password }; // Ajouter le nouveau mot de passe
      } else if (password && password !== confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas.');
        return; // Quitter la fonction si les mots de passe ne correspondent pas
      } else if (password && password.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères.');
        return; // Quitter la fonction si la longueur du mot de passe est inférieure à 6
      }

      // Supprimer le champ password si aucun nouveau mot de passe n'est saisi
      if (!password) {
        delete userData.password;
      }

      await dispatch(modifyUser({ id, userData }));
      setPassword('');
      setConfirmPassword('');

      toast.success('Utilisateur mis à jour avec succès');
    } catch (error) {
      console.error("Une erreur s'est produite lors de la mise à jour de l'utilisateur :", error);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const defaultTheme = createTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  {/*if (!user) {
    return <Typography variant="h6" align="center" sx={{ mt: 5 }}>Aucun utilisateur trouvé</Typography>;
  } */}

  return (
    <div >
      <NavBar />
      <div >
        <ThemeProvider theme={defaultTheme}>
          <Container component="main" maxWidth="md">
            <CssBaseline />
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <FaUser />
              </Avatar>
              <Typography component="h1" variant="h6">
                Gérer son compte
              </Typography>
              <Box component="form" onSubmit={handleUpdateUser}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoFocus
                      margin="normal"
                      required
                      fullWidth
                      label="lastname"
                      name="lastName"
                      value={userDataToUpdate.lastName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoFocus
                      margin="normal"
                      required
                      fullWidth
                      label="firstname"
                      name="firstName"
                      value={userDataToUpdate.firstName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Email"
                      name="email"
                      value={userDataToUpdate.email}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Tel"
                      name="telephone"
                      value={userDataToUpdate.telephone}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Changer le mot de passe (facultatif)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Mot de passe"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={toggleShowPassword}>
                              {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Confirmer le mot de passe"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={toggleShowConfirmPassword}>
                              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} container spacing={2}>
                    <Grid item xs={6}>
                      <Button type="submit" variant="contained" color="primary" fullWidth>
                        Enregistrer
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button onClick={handleCancel} variant="contained" color="warning" fullWidth>
                        Annuler
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Container>
        </ThemeProvider>
      </div>
    </div>
  );
};

export default ManageUserUpdateUser;