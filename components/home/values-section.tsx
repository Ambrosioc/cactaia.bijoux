'use client';

import { Shield, Leaf, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  {
    icon: Shield,
    title: 'Qualité durable',
    description: 'Nos bijoux sont créés en acier inoxydable hypoallergénique pour vous accompagner au fil du temps.',
  },
  {
    icon: Leaf,
    title: 'Écoresponsable',
    description: 'Notre démarche éthique privilégie des matériaux responsables et un artisanat respectueux de l\'environnement.',
  },
  {
    icon: Clock,
    title: 'Intemporalité',
    description: 'Des créations à l\'élégance intemporelle qui transcendent les modes pour un style qui vous ressemble.',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.5,
    },
  }),
};

const ValuesSection = () => {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Nos valeurs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chez Cactaia.Bijoux, nous croyons en la beauté durable et l'élégance naturelle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              custom={i}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-white p-8 rounded-lg shadow-sm text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <value.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;