import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingAnimationProps {
  loadingMessage: string;
  className?: string;
}

export default function LoadingAnimation({
  loadingMessage,
  className = "",
}: Readonly<LoadingAnimationProps>) {
  return (
    <div
      className={`flex flex-col items-center justify-center h-screen ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <Loader2 className="w-12 h-12 text-blue-500" />
      </motion.div>
      <div className="mt-4 text-lg font-semibold text-gray-700">
        {loadingMessage}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            times: [0, 0.2, 1],
          }}
        >
          .
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            times: [0, 0.2, 1],
            delay: 0.5,
          }}
        >
          .
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            times: [0, 0.2, 1],
            delay: 1,
          }}
        >
          .
        </motion.span>
      </div>
    </div>
  );
}
