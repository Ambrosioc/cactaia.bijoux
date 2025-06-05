'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sophie M.',
    comment: 'J\'adore mes boucles d\'oreilles Cactaia, elles sont légères et si élégantes ! La qualité est vraiment au rendez-vous.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Thomas L.',
    comment: 'J\'ai offert un bracelet à ma compagne et elle ne le quitte plus. Le service client a été très réactif pour m\'aider à choisir.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emma B.',
    comment: 'Ces bijoux sont devenus mes indispensables au quotidien. J\'apprécie particulièrement leur côté intemporel.',
    rating: 4,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Ce que nos clients disent</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les témoignages de nos clients qui portent nos créations au quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < testimonial.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                &quot;{testimonial.comment}&quot;
              </p>
              <p className="font-medium">{testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;