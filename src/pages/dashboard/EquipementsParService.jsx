/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchServiceById, fetchServices } from '../../redux/slices/hospitalServiceSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Typography } from '@mui/material';

const EquipementsParService = ({ data }) => {

    const services = useSelector((state) => state.hospitalService.services);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchServices());
    }, [dispatch]);

    useEffect(() => {
        const uniqueServiceIds = [...new Set(data.map(equipment => equipment.serviceId))];
        uniqueServiceIds.forEach(id => {
            if (!services[id]) {
                dispatch(fetchServiceById(id)); 
            }
        });
    }, [dispatch, data, services]);

    const serviceData = data.reduce((acc, equipment) => {
        const serviceId = equipment.serviceId;
    
        if (!acc[serviceId]) {
            // Recherche du service dans le tableau services
            const service = services.find(service => service.id === serviceId);
            const serviceName = service ? service.name : `Service ${serviceId}`;
            acc[serviceId] = {
                serviceName: serviceName,
                equipmentCount: 0
            };
        }
    
        acc[serviceId].equipmentCount += 1;
        return acc;
    }, {});

    const chartData = Object.values(serviceData).map(service => ({
        serviceName: service.serviceName,
        equipmentCount: service.equipmentCount,
    }));

    if (!chartData.length) {
        return <div>Aucune donnée disponible</div>;
    }

    // Générer la description
    const totalEquipments = chartData.reduce((acc, service) => acc + service.equipmentCount, 0);
    const serviceWithMostEquipments = chartData.reduce((prev, current) => (prev.equipmentCount > current.equipmentCount ? prev : current), {});

    const description = `
      Ce graphique montre la répartition des équipements par service dans l'hôpital.
      Le total des équipements est de ${totalEquipments}.
      Le service avec le plus grand nombre d'équipements est ${serviceWithMostEquipments.serviceName}, avec ${serviceWithMostEquipments.equipmentCount} équipements.
      Vous pouvez observer ici l'importance de chaque service dans la gestion des équipements de l'hôpital.
    `;



    return (
        <Card sx={{ p: 2, borderRadius: '2xl', boxShadow: 3 }}>
                  <CardContent>

                  <Typography variant="h6" color="green" gutterBottom>
                  Répartition des équipements par service</Typography>
                  <Typography variant="body1" color="black" sx={{ mb: 2, whiteSpace: 'pre-line' }}>

          {description}</Typography>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="serviceName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="equipmentCount" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default EquipementsParService;
