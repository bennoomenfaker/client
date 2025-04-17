import  { useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../../redux/slices/authSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

export default function ResetPassword() {
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.trim() === '' || confirmPassword.trim() === '') {
      toast.warning('Veuillez remplir les champs');
      return;
    }

    if (password.length < 6) {
      toast.warning('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('Les mots de passe ne correspondent pas');
      return;
    }


    try {
      const response = await dispatch(resetPassword({ token, newPassword: password })).unwrap();
  
        toast.success(response.message);
       
        navigate('/'); // Rediriger vers une autre page si la réinitialisation est réussie
      
    } catch (error) {

      // Afficher le message d'erreur spécifique
      toast.error(error || "Une erreur s'est produite lors de la réinitialisation du mot de passe. Veuillez réessayer.");
    } finally {
      setPassword('');
      setConfirmPassword('');
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Réinitialisation du mot de passe
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            
            id="password"
            label="Nouveau mot de passe"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            InputProps={{
              endAdornment: (
                <span
                  className="eye-icon"
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              ),
            }}
          />
          <TextField
            fullWidth
            
            id="confirmPassword"
            label="Confirmer le nouveau mot de passe"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            InputProps={{
              endAdornment: (
                <span
                  className="eye-icon"
                  onClick={toggleShowConfirmPassword}
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              ),
            }}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Réinitialiser
          </Button>
        
        </Box>
      </Box>
    </Container>
  );
}
