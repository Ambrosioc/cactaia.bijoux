'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Archive,
    Copy,
    Download,
    Edit,
    Eye,
    FileText,
    Grid3X3,
    Image,
    List,
    Music,
    Plus,
    Search,
    Trash2,
    Video
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MediaFile {
    id: string;
    name: string;
    filename: string;
    type: 'image' | 'video' | 'document' | 'audio' | 'archive';
    mime_type: string;
    size: number;
    url: string;
    thumbnail_url?: string;
    alt_text?: string;
    description?: string;
    tags: string[];
    category: string;
    used_in: string[];
    uploaded_at: string;
    uploaded_by: string;
}

export default function MediasPage() {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        alt_text: '',
        description: '',
        tags: '',
        category: 'blog'
    });

    useEffect(() => {
        loadMediaFiles();
    }, []);

    const loadMediaFiles = async () => {
        try {
            setLoading(true);
            // TODO: Implémenter l'API pour récupérer les médias

            // Données temporaires pour la démo
            setMediaFiles([
                {
                    id: '1',
                    name: 'Image de blog - Bijoux élégants',
                    filename: 'bijoux-elegants.jpg',
                    type: 'image',
                    mime_type: 'image/jpeg',
                    size: 2048576, // 2MB
                    url: '/images/blog/bijoux-elegants.jpg',
                    thumbnail_url: '/images/blog/thumbnails/bijoux-elegants.jpg',
                    alt_text: 'Collection de bijoux élégants sur fond blanc',
                    description: 'Image principale pour l\'article sur les tendances bijoux',
                    tags: ['bijoux', 'élégance', 'tendances', 'collection'],
                    category: 'blog',
                    used_in: ['article-tendances-2025'],
                    uploaded_at: '2025-01-15',
                    uploaded_by: 'admin'
                },
                {
                    id: '2',
                    name: 'Vidéo tuto - Entretien bijoux',
                    filename: 'tuto-entretien.mp4',
                    type: 'video',
                    mime_type: 'video/mp4',
                    size: 15728640, // 15MB
                    url: '/videos/tuto-entretien.mp4',
                    thumbnail_url: '/images/blog/thumbnails/tuto-entretien.jpg',
                    alt_text: 'Tutoriel vidéo sur l\'entretien des bijoux',
                    description: 'Vidéo explicative pour l\'article d\'entretien',
                    tags: ['tutoriel', 'entretien', 'vidéo', 'conseils'],
                    category: 'blog',
                    used_in: ['article-entretien-bijoux'],
                    uploaded_at: '2025-01-16',
                    uploaded_by: 'admin'
                },
                {
                    id: '3',
                    name: 'Guide PDF - Soins bijoux',
                    filename: 'guide-soins-bijoux.pdf',
                    type: 'document',
                    mime_type: 'application/pdf',
                    size: 1048576, // 1MB
                    url: '/documents/guide-soins-bijoux.pdf',
                    alt_text: 'Guide PDF sur les soins des bijoux',
                    description: 'Document téléchargeable pour les clients',
                    tags: ['guide', 'soins', 'PDF', 'téléchargement'],
                    category: 'blog',
                    used_in: ['page-soins-bijoux'],
                    uploaded_at: '2025-01-17',
                    uploaded_by: 'admin'
                }
            ]);
        } catch (error) {
            console.error('Erreur lors du chargement des médias:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMedia) {
                // TODO: Implémenter la mise à jour
                console.log('Mise à jour média:', editingMedia.id, formData);
            } else {
                // TODO: Implémenter la création
                console.log('Création média:', formData);
            }

            setShowUploadForm(false);
            setEditingMedia(null);
            setFormData({ name: '', alt_text: '', description: '', tags: '', category: 'blog' });
            await loadMediaFiles();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const handleEdit = (media: MediaFile) => {
        setEditingMedia(media);
        setFormData({
            name: media.name,
            alt_text: media.alt_text || '',
            description: media.description || '',
            tags: media.tags.join(', '),
            category: media.category
        });
        setShowUploadForm(true);
    };

    const handleDelete = async (mediaId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return;

        try {
            // TODO: Implémenter la suppression
            console.log('Suppression média:', mediaId);
            await loadMediaFiles();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // TODO: Ajouter une notification de succès
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'image': return <Image className="h-5 w-5" />;
            case 'video': return <Video className="h-5 w-5" />;
            case 'document': return <FileText className="h-5 w-5" />;
            case 'audio': return <Music className="h-5 w-5" />;
            case 'archive': return <Archive className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            image: 'Image',
            video: 'Vidéo',
            document: 'Document',
            audio: 'Audio',
            archive: 'Archive'
        };
        return labels[type as keyof typeof labels] || type;
    };

    const filteredMedia = mediaFiles.filter(media =>
        (selectedCategory === 'all' || media.category === selectedCategory) &&
        (searchTerm === '' ||
            media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            media.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            media.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement des médias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Médias</h1>
                    <p className="text-muted-foreground">
                        Gérez les images, vidéos et documents de votre blog
                    </p>
                </div>
                <Button onClick={() => setShowUploadForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un média
                </Button>
            </div>

            {/* Filtres et recherche */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par nom, tags ou description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-input rounded-md"
                        >
                            <option value="all">Toutes les catégories</option>
                            <option value="blog">Blog</option>
                            <option value="produits">Produits</option>
                            <option value="marketing">Marketing</option>
                            <option value="autres">Autres</option>
                        </select>
                        <div className="flex border rounded-md">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="rounded-r-none"
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="rounded-l-none"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formulaire d'ajout/modification */}
            {showUploadForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingMedia ? 'Modifier le média' : 'Ajouter un nouveau média'}
                        </CardTitle>
                        <CardDescription>
                            {editingMedia ? 'Modifiez les informations du média' : 'Ajoutez un nouveau fichier média'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom du média</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Image de blog - Bijoux élégants"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Catégorie</Label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-input rounded-md"
                                        required
                                    >
                                        <option value="blog">Blog</option>
                                        <option value="produits">Produits</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="autres">Autres</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alt_text">Texte alternatif (SEO)</Label>
                                <Input
                                    id="alt_text"
                                    value={formData.alt_text}
                                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                                    placeholder="Description de l'image pour l'accessibilité et le SEO"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description détaillée du média"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="Ex: bijoux, élégance, tendances (séparés par des virgules)"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Séparez les tags par des virgules
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingMedia ? 'Mettre à jour' : 'Ajouter'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setEditingMedia(null);
                                        setFormData({ name: '', alt_text: '', description: '', tags: '', category: 'blog' });
                                    }}
                                >
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Onglets principaux */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">Tous les médias ({filteredMedia.length})</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Vidéos</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    {filteredMedia.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground text-center py-8">
                                    {searchTerm || selectedCategory !== 'all'
                                        ? 'Aucun média trouvé pour cette recherche'
                                        : 'Aucun média ajouté pour le moment'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                            {filteredMedia.map((media) => (
                                <Card key={media.id} className="overflow-hidden">
                                    {viewMode === 'grid' && media.thumbnail_url && (
                                        <div className="aspect-video bg-muted relative">
                                            <img
                                                src={media.thumbnail_url}
                                                alt={media.alt_text || media.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge variant="secondary">
                                                    {getTypeLabel(media.type)}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(media.type)}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-medium text-sm truncate">{media.name}</h3>
                                                    <p className="text-xs text-muted-foreground truncate">{media.filename}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{formatFileSize(media.size)}</span>
                                                <span>{new Date(media.uploaded_at).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            {media.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {media.description}
                                                </p>
                                            )}
                                            {media.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {media.tags.slice(0, 3).map((tag, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {media.tags.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{media.tags.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(media.url, '_blank')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(media.url)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(media)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(media.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMedia.filter(m => m.type === 'image').map((media) => (
                            <Card key={media.id} className="overflow-hidden">
                                <div className="aspect-video bg-muted relative">
                                    <img
                                        src={media.thumbnail_url || media.url}
                                        alt={media.alt_text || media.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-medium mb-2">{media.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="videos" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMedia.filter(m => m.type === 'video').map((media) => (
                            <Card key={media.id} className="overflow-hidden">
                                <div className="aspect-video bg-muted relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Video className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-medium mb-2">{media.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMedia.filter(m => m.type === 'document').map((media) => (
                            <Card key={media.id} className="overflow-hidden">
                                <div className="aspect-video bg-muted relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FileText className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-medium mb-2">{media.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
