import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, verifyEmail, getProfile } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { CircularProgress } from '@mui/material';

export default function Signin() {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const loading = useSelector((state) => state.auth.loading);
      if (loading) {
        return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
             <CircularProgress />
            </div>)
      }

    // Gestion du changement de champs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gestion de la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = formData;

        // Validation des champs
        if (!email.trim()) {
            toast.warning('Veuillez remplir le champ email.');
            return;
        }
        if (!password.trim()) {
            toast.warning('Veuillez remplir le champ mot de passe.');
            return;
        }

        try {
            // Vérification de l'email
            const verifyResponse = await dispatch(verifyEmail(email));
            if (!verifyResponse.payload) {
                toast.warning('Adresse e-mail non trouvée.');
                return;
            } 

            // Connexion
            const result = await dispatch(signIn(formData));
            if (!result.payload) {
                toast.error('Erreur lors de la connexion.');
                return;
            }

            // Vérification des identifiants incorrects
            if (result.payload === 'Bad credentials') {
                toast.error('Identifiants incorrects. Veuillez réessayer.');
                return;
            }

            // Récupération du profil utilisateur
            const profile = await dispatch(getProfile());
            if (!profile.payload) {
                toast.error("Erreur lors de la récupération du profil.");
                return;
            }

            // Vérification de l'activation du compte
            if (!profile?.payload?.activated) {
                toast.error("L'utilisateur est désactivé. Veuillez contacter l'administration.");
                return;
            }

            // Connexion réussie
            const { firstName, lastName } = profile.payload;
            toast.success(`Bienvenue ${firstName} ${lastName}`);

        } catch (error) {
            toast.error(error?.message || 'Erreur lors de la connexion.');
        }
    };

    // Toggle affichage du mot de passe
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const defaultTheme = createTheme();

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <div style={{ height: '100vh', overflow: 'hidden' }}>
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Se connecter
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Adresse e-mail"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                label="Mot de passe"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={toggleShowPassword}
                                                edge="end"
                                                aria-label="toggle password visibility"
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Connexion...' : 'Se Connecter'}
                            </Button>
                            <Grid container>
                            <Grid item xs>
                                <Link
                                to="/forgot-password"
                                style={{
                                    color: '#1976D2', // Bleu Material-UI
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem',
                                    transition: 'color 0.3s ease',
                                }}
                                aria-label="Réinitialiser le mot de passe"
                                >
                                Mot de passe oublié ?
                                </Link>
                            </Grid>
                            </Grid>
                                                    </Box>
                    </Box>
                </div>
            </Container>
        </ThemeProvider>
    );
}
