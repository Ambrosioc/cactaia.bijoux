'use client';

import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  genre: 'Homme' | 'Femme' | 'Autre' | '';
  dateNaissance: string;
  cgvAccepted: boolean;
  newsletter: boolean;
}

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    genre: '',
    dateNaissance: '',
    cgvAccepted: false,
    newsletter: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userCreated, setUserCreated] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { refreshUser } = useUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.cgvAccepted) {
      newErrors.cgvAccepted = 'Vous devez accepter les conditions générales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.genre) {
      newErrors.genre = 'Le genre est obligatoire';
    }
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire';
    }
    if (!formData.dateNaissance) {
      newErrors.dateNaissance = 'La date de naissance est obligatoire';
    } else {
      // Vérifier que l'utilisateur a au moins 13 ans
      const birthDate = new Date(formData.dateNaissance);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (age < 13 || (age === 13 && monthDiff < 0) || (age === 13 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        newErrors.dateNaissance = 'Vous devez avoir au moins 13 ans';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1()) {
      return;
    }

    setLoading(true);

    try {
      // Créer l'utilisateur dans auth.users
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'Cette adresse email est déjà utilisée' });
        } else {
          setErrors({ general: error.message });
        }
        return;
      }

      if (data.user) {
        // Mettre à jour le profil utilisateur avec les informations de base
        const { error: updateError } = await supabase
          .from('users')
          .update({
            cgv_accepted: formData.cgvAccepted,
            cgv_accepted_at: new Date().toISOString(),
            profile_completed: false, // Marquer le profil comme incomplet
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Erreur lors de la mise à jour du profil:', updateError);
          setErrors({ general: 'Erreur lors de la création du profil' });
          return;
        }

        setUserCreated(true);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setErrors({ general: 'Une erreur est survenue lors de l\'inscription' });
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setErrors({ general: 'Utilisateur non trouvé' });
        return;
      }

      // Mettre à jour le profil utilisateur avec les informations complètes
      const { error: updateError } = await supabase
        .from('users')
        .update({
          nom: formData.nom,
          prenom: formData.prenom,
          genre: formData.genre as 'Homme' | 'Femme' | 'Autre',
          date_naissance: formData.dateNaissance,
          newsletter: formData.newsletter,
          profile_completed: true, // Marquer le profil comme complet
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du profil:', updateError);
        setErrors({ general: 'Erreur lors de la mise à jour du profil' });
        return;
      }

      // Déclencher l'envoi de l'email de bienvenue
      try {
        await fetch('/api/emails/welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
      }

      // Rafraîchir le profil utilisateur dans le store
      await refreshUser();

      // Rediriger vers le compte utilisateur
      router.push('/compte');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setErrors({ general: 'Une erreur est survenue lors de la mise à jour du profil' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-32 h-12 relative mx-auto mb-6">
          <Image
            src="/CACTAIA LOGO_CACTAIA LOGO TERRA-07.png"
            alt="Cactaia Bijoux Logo"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-light text-gray-900 mb-2">Créer un compte</h1>
        <p className="text-gray-600">
          Étape 1 sur 2 - Informations de connexion
        </p>
      </div>

      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
        >
          {errors.general}
        </motion.div>
      )}

      <form onSubmit={handleStep1Submit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Adresse email *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="votre@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Mots de passe */}
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* CGV obligatoire */}
        <div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                name="cgvAccepted"
                checked={formData.cgvAccepted}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${formData.cgvAccepted
                ? 'bg-primary border-primary'
                : errors.cgvAccepted
                  ? 'border-red-300'
                  : 'border-gray-300'
                }`}>
                {formData.cgvAccepted && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
            <span className="text-sm text-gray-600 leading-relaxed">
              J&apos;accepte les{' '}
              <Link href="/cgv" className="text-primary hover:underline">
                Conditions générales de vente
              </Link>{' '}
              et la{' '}
              <Link href="/politique-de-confidentialite" className="text-primary hover:underline">
                politique de confidentialité
              </Link> *
            </span>
          </label>
          {errors.cgvAccepted && (
            <p className="text-red-500 text-xs mt-1">{errors.cgvAccepted}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-4 px-6 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Création en cours...
            </>
          ) : (
            <>
              Continuer
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-32 h-12 relative mx-auto mb-6">
          <Image
            src="/CACTAIA LOGO_CACTAIA LOGO TERRA-07.png"
            alt="Cactaia Bijoux Logo"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-light text-gray-900 mb-2">Compléter votre profil</h1>
        <p className="text-gray-600">
          Étape 2 sur 2 - Informations personnelles
        </p>
      </div>

      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
        >
          {errors.general}
        </motion.div>
      )}

      <form onSubmit={handleStep2Submit} className="space-y-6">
        {/* Genre */}
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
            Genre *
          </label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className={`w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm ${errors.genre ? 'border-red-300 focus:ring-red-500' : ''}`}
          >
            <option value="">Sélectionner</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
            <option value="Autre">Autre</option>
          </select>
          {errors.genre && (
            <p className="text-red-500 text-xs mt-1">{errors.genre}</p>
          )}
        </div>

        {/* Nom et Prénom */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
              Prénom *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm ${errors.prenom ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Prénom"
              />
            </div>
            {errors.prenom && (
              <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>
            )}
          </div>

          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm ${errors.nom ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Nom"
              />
            </div>
            {errors.nom && (
              <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
            )}
          </div>
        </div>

        {/* Date de naissance */}
        <div>
          <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700 mb-2">
            Date de naissance *
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              id="dateNaissance"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
              className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white/50 backdrop-blur-sm ${errors.dateNaissance ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
          </div>
          {errors.dateNaissance && (
            <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>
          )}
        </div>

        {/* Newsletter facultative */}
        <div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${formData.newsletter ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                {formData.newsletter && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
            <span className="text-sm text-gray-600">
              Je souhaite recevoir les informations sur les offres spéciales, les soldes et les actualités.
            </span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-4 px-6 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Finalisation...
              </>
            ) : (
              <>
                Terminer
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </div>

      {/* Section droite - Image immersive */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        <Image
          src="/images/cactaïa-25.jpg"
          alt="Bijoux Cactaia"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Overlay avec texte */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center text-white p-8"
          >
            <h2 className="text-4xl font-light mb-4">Des bijoux qui vous ressemblent</h2>
            <p className="text-lg text-white/90 max-w-md">
              Découvrez notre collection de bijoux écoresponsables, mixtes et élégants
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}