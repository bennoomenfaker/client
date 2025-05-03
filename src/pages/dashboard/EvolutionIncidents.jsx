/* eslint-disable react/prop-types */
import { Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EvolutionIncidents = ({ data }) => {
    const countsByDate = {};

    data.forEach(item => {
        const reportedDate = new Date(item.incident.reportedAt).toLocaleDateString();
        const validatedDate = item.incident.validatedAt ? new Date(item.incident.validatedAt).toLocaleDateString() : null;
        const resolvedDate = item.incident.resolvedAt ? new Date(item.incident.resolvedAt).toLocaleDateString() : null;

        if (!countsByDate[reportedDate]) countsByDate[reportedDate] = { date: reportedDate, reportedCount: 0, validatedCount: 0, resolvedCount: 0 };
        countsByDate[reportedDate].reportedCount += 1;

        if (validatedDate) {
            if (!countsByDate[validatedDate]) countsByDate[validatedDate] = { date: validatedDate, reportedCount: 0, validatedCount: 0, resolvedCount: 0 };
            countsByDate[validatedDate].validatedCount += 1;
        }

        if (resolvedDate) {
            if (!countsByDate[resolvedDate]) countsByDate[resolvedDate] = { date: resolvedDate, reportedCount: 0, validatedCount: 0, resolvedCount: 0 };
            countsByDate[resolvedDate].resolvedCount += 1;
        }
    });

    const formattedData = Object.values(countsByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalReported = formattedData.reduce((sum, d) => sum + d.reportedCount, 0);
    const totalValidated = formattedData.reduce((sum, d) => sum + d.validatedCount, 0);
    const totalResolved = formattedData.reduce((sum, d) => sum + d.resolvedCount, 0);

    const description = `
    Ce graphique illustre l'évolution du traitement des incidents dans le temps :
    
    - ${totalReported} incidents ont été signalés
    - ${totalValidated} ont été validés par un ingénieur
    - ${totalResolved} ont été résolus
    
    Chaque courbe représente une étape du cycle de vie des incidents.
    Cela permet de visualiser les pics d'activité, les délais de traitement et l'efficacité de la résolution.
    `;
    

    return (
        <Card sx={{ p: 2, borderRadius: '2xl', boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" color="green" gutterBottom>
                    Évolution des incidents dans le temps
                </Typography>
                <Typography variant="body1" color="black" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                    {description}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="reportedCount" stroke="#8884d8" name="Signalés" />
                        <Line type="monotone" dataKey="validatedCount" stroke="#82ca9d" name="Validés" />
                        <Line type="monotone" dataKey="resolvedCount" stroke="#ff7300" name="Résolus" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default EvolutionIncidents;
