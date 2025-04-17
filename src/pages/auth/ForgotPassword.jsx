import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, verifyEmail } from '../../redux/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);


  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() === '') {
      toast.warning('Veuillez remplir le champ email.');
      return;
    }
    // Vérification de l'email
    const existEmail = await dispatch(verifyEmail(email));
    if (existEmail.payload == false) {
      toast.warning('Adresse e-mail non trouvée.');
      return;
    }

    dispatch(forgotPassword(email));

    navigate('/');
    toast.success('Un e-mail a été envoyé à votre adresse e-mail pour réinitialiser votre mot de passe.');

  };

  return (
    <Container component="main" maxWidth="xs">
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
          Oublier mot de passe
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            fullWidth
            required
            id="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Cliquer'}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link
                to="/"
                style={{
                  color: '#1976D2', // Bleu Material-UI
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease',
                }}
                aria-label="Retourner à la page de connexion"
              >
                Retour à la connexion
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
