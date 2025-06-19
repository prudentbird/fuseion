import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export const Greeting = () => {
  const { data: session } = useSession();

  return (
    <div
      key="overview"
      className="absolute inset-0 flex flex-col justify-center items-center max-w-3xl mx-auto px-8 pb-30"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold"
      >
        How can I help you
        {session && session.user
          ? `, ${session.user.name.split(' ')[0]}?`
          : ' ?'}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-zinc-500"
      >
        Send a message to get started
      </motion.div>
    </div>
  );
};
