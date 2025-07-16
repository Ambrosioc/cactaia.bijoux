'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface NewsletterModalProps {
    children: React.ReactNode;
}

const NewsletterModal = ({ children }: NewsletterModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
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

    const handleClose = () => {
        setIsOpen(false);
        // Reset states when closing
        setTimeout(() => {
            setIsSuccess(false);
            setError(null);
            setDiscountCode(null);
            setFormData({
                civilite: 'Madame',
                prenom: '',
                nom: '',
                date_naissance: '',
                email: ''
            });
        }, 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <Mail className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-semibold">Newsletter</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-normal">
                            Inscrivez-vous à notre newsletter et obtenez une réduction sur votre première commande !
                        </p>
                    </DialogTitle>
                </DialogHeader>

                {isSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </motion.div>

                        <h3 className="text-xl font-semibold text-foreground mb-4">
                            Inscription réussie !
                        </h3>

                        <p className="text-muted-foreground mb-6">
                            Merci de vous être inscrit à notre newsletter. Vous recevrez bientôt nos dernières actualités !
                        </p>

                        {discountCode && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-6">
                                <p className="text-sm text-muted-foreground mb-2">Votre code de réduction :</p>
                                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-mono text-lg font-bold">
                                    {discountCode}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Utilisez ce code lors de votre première commande
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={handleClose}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            Fermer
                        </Button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        {/* Civilité */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-foreground">
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
                                <Label htmlFor="prenom" className="text-sm font-medium text-foreground">
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
                                <Label htmlFor="nom" className="text-sm font-medium text-foreground">
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
                            <Label htmlFor="date_naissance" className="text-sm font-medium text-foreground">
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
                            <Label htmlFor="email" className="text-sm font-medium text-foreground">
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
                                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                            >
                                <p className="text-sm text-destructive">{error}</p>
                            </motion.div>
                        )}

                        {/* Bouton de soumission */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
                        <p className="text-xs text-muted-foreground text-center">
                            En vous inscrivant, vous acceptez de recevoir nos newsletters et acceptez notre{' '}
                            <a href="/mentions-legales" className="text-primary hover:underline">
                                politique de confidentialité
                            </a>
                            .
                        </p>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default NewsletterModal; 