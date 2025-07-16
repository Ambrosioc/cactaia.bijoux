'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Send } from 'lucide-react';
import { useState } from 'react';

interface NewsletterFormData {
    civilite: 'Madame' | 'Monsieur';
    prenom: string;
    nom: string;
    date_naissance: string;
    email: string;
}

const NewsletterForm = () => {
    const [formData, setFormData] = useState<NewsletterFormData>({
        civilite: 'Madame',
        prenom: '',
        nom: '',
        date_naissance: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [discountCode, setDiscountCode] = useState<string | null>(null);

    const handleInputChange = (field: keyof NewsletterFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l&apos;inscription');
            }

            setIsSuccess(true);
            setDiscountCode(data.code_reduction);

            // Reset form
            setFormData({
                civilite: 'Madame',
                prenom: '',
                nom: '',
                date_naissance: '',
                email: ''
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l&apos;inscription');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <Card className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </motion.div>

                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Inscription réussie !
                        </h3>

                        <p className="text-gray-600 mb-6">
                            Merci de vous être inscrit à notre newsletter. Vous recevrez bientôt nos dernières actualités !
                        </p>

                        {discountCode && (
                            <div className="bg-white p-4 rounded-lg border border-green-200 mb-6">
                                <p className="text-sm text-gray-600 mb-2">Votre code de réduction :</p>
                                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-mono text-lg font-bold">
                                    {discountCode}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Utilisez ce code lors de votre première commande
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={() => setIsSuccess(false)}
                            variant="outline"
                            className="w-full"
                        >
                            S&apos;inscrire à nouveau
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                            <Mail className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                            Newsletter
                        </h3>
                        <p className="text-gray-600">
                            Inscrivez-vous à notre newsletter et obtenez une réduction sur votre première commande !
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Civilité */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                                Civilité *
                            </Label>
                            <RadioGroup
                                value={formData.civilite}
                                onValueChange={(value) => handleInputChange('civilite', value as 'Madame' | 'Monsieur')}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Madame" id="madame" />
                                    <Label htmlFor="madame" className="text-sm">Madame</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Monsieur" id="monsieur" />
                                    <Label htmlFor="monsieur" className="text-sm">Monsieur</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Prénom et Nom */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prenom" className="text-sm font-medium text-gray-700">
                                    Prénom *
                                </Label>
                                <Input
                                    id="prenom"
                                    type="text"
                                    value={formData.prenom}
                                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                                    placeholder="Votre prénom"
                                    required
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nom" className="text-sm font-medium text-gray-700">
                                    Nom *
                                </Label>
                                <Input
                                    id="nom"
                                    type="text"
                                    value={formData.nom}
                                    onChange={(e) => handleInputChange('nom', e.target.value)}
                                    placeholder="Votre nom"
                                    required
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Date de naissance */}
                        <div className="space-y-2">
                            <Label htmlFor="date_naissance" className="text-sm font-medium text-gray-700">
                                Date de naissance *
                            </Label>
                            <Input
                                id="date_naissance"
                                type="date"
                                value={formData.date_naissance}
                                onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                                required
                                className="w-full"
                                max={new Date().toISOString().split('T')[0]}
                                min="1900-01-01"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Adresse e-mail *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="votre.email@exemple.com"
                                required
                                className="w-full"
                            />
                        </div>

                        {/* Message d'erreur */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 border border-red-200 rounded-lg"
                            >
                                <p className="text-sm text-red-600">{error}</p>
                            </motion.div>
                        )}

                        {/* Bouton de soumission */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Inscription en cours...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    S&apos;inscrire à la newsletter
                                </div>
                            )}
                        </Button>

                        {/* Informations légales */}
                        <p className="text-xs text-gray-500 text-center">
                            En vous inscrivant, vous acceptez de recevoir nos newsletters et acceptez notre{' '}
                            <a href="/mentions-legales" className="text-primary hover:underline">
                                politique de confidentialité
                            </a>
                            .
                        </p>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default NewsletterForm; 