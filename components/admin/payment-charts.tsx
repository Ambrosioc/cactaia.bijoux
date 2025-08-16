'use client';

import { motion } from 'framer-motion';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface PaymentStats {
    total_payments: number;
    total_amount: number;
    successful_payments: number;
    failed_payments: number;
    pending_payments: number;
    canceled_payments: number;
    average_amount: number;
}

interface DailyStats {
    date: string;
    count: number;
    amount: number;
}

interface PaymentChartsProps {
    stats: PaymentStats;
    dailyStats: DailyStats[];
    period: string;
}

const COLORS = {
    success: '#10b981',
    pending: '#f59e0b',
    failed: '#ef4444',
    canceled: '#6b7280',
    primary: '#3b82f6',
    secondary: '#8b5cf6'
};

export default function PaymentCharts({ stats, dailyStats, period }: PaymentChartsProps) {
    // Données pour le graphique en camembert des statuts
    const statusData = [
        { name: 'Réussis', value: stats.successful_payments, color: COLORS.success },
        { name: 'En attente', value: stats.pending_payments, color: COLORS.pending },
        { name: 'Échoués', value: stats.failed_payments, color: COLORS.failed },
        { name: 'Annulés', value: stats.canceled_payments, color: COLORS.canceled }
    ].filter(item => item.value > 0);

    // Données pour le graphique en barres des montants quotidiens
    const amountData = dailyStats.map(item => ({
        date: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        montant: item.amount,
        count: item.count
    }));

    // Données pour le graphique linéaire des paiements quotidiens
    const countData = dailyStats.map(item => ({
        date: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        paiements: item.count,
        montant: item.amount
    }));

    const formatAmount = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.dataKey === 'montant' ? formatAmount(entry.value) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Graphique des tendances */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm border"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Évolution des Paiements ({period})
                    </h3>
                </div>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={countData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={12}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#6b7280"
                                fontSize={12}
                                label={{ value: 'Nombre de paiements', angle: -90, position: 'insideLeft' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#8b5cf6"
                                fontSize={12}
                                label={{ value: 'Montant (€)', angle: 90, position: 'insideRight' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="paiements"
                                stroke={COLORS.primary}
                                strokeWidth={3}
                                dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="montant"
                                stroke={COLORS.secondary}
                                strokeWidth={2}
                                dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 3 }}
                                activeDot={{ r: 5, stroke: COLORS.secondary, strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Graphique en camembert des statuts */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        Répartition par Statut
                    </h3>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [value, 'Paiements']}
                                    labelFormatter={(label) => label}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Graphique en barres des montants quotidiens */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                >
                    <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        Montants Quotidiens
                    </h3>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={amountData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tickFormatter={(value) => `${value}€`}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    formatter={(value: number) => [formatAmount(value), 'Montant']}
                                />
                                <Bar
                                    dataKey="montant"
                                    fill={COLORS.primary}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Graphique en aire des tendances de montants */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-sm border"
            >
                <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Évolution des Montants ({period})
                </h3>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={amountData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={12}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tickFormatter={(value) => `${value}€`}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                formatter={(value: number) => [formatAmount(value), 'Montant']}
                            />
                            <Area
                                type="monotone"
                                dataKey="montant"
                                stroke={COLORS.primary}
                                fill={COLORS.primary}
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
