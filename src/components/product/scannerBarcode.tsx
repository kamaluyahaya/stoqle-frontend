'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X } from 'lucide-react';

export default function BarcodeScannerModal({
  onDetected,
  onClose,
}: {
  onDetected: (value: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const readerRef = useRef(new BrowserMultiFormatReader());
  const [startScanning, setStartScanning] = useState(false);
  const hasScannedRef = useRef(false);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load beep sound
  useEffect(() => {
    beepAudioRef.current = new Audio('/beep/count.mp3');
    beepAudioRef.current.load();
  }, []);

  // List video devices
useEffect(() => {
  (async () => {
    try {
      // Explicitly request camera access
      await navigator.mediaDevices.getUserMedia({ video: true });

      // Now list devices
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      setVideoInputDevices(devices);
      if (devices.length > 0) {
        setSelectedDeviceId(devices[0].deviceId);
        setStartScanning(true);
      }
    } catch (err) {
      console.error("Camera permission denied or error occurred:", err);
    }
  })();
}, []);


  // Start scanning
  useEffect(() => {
    if (!startScanning || !selectedDeviceId || !videoRef.current) return;

    const reader = readerRef.current;

    reader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, error) => {
      if (result && !hasScannedRef.current) {
        hasScannedRef.current = true;
        beepAudioRef.current?.play();
        onDetected(result.getText());
        stopVideoStream();
        (reader as any)?.reset?.();
        onClose();
      }
    });

    return () => {
      stopVideoStream();
      (reader as any)?.reset?.();
    };
  }, [startScanning, selectedDeviceId]);

  // Stop camera stream
  const stopVideoStream = () => {
    const video = videoRef.current;
    if (video) {
      const stream = video.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
      video.pause();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-md p-6"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              stopVideoStream();
              (readerRef.current as any)?.reset?.();
              onClose();
            }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition"
          >
            <X size={14} strokeWidth={2} />
          </button>

          {/* Header */}
          <div className="text-center mt-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Scan Barcode</h2>
            <p className="text-sm text-gray-500">Align the barcode within the frame</p>
          </div>

          {/* Video Scanner */}
          <div className="overflow-hidden rounded-xl border border-gray-300 bg-black shadow-inner">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              autoPlay
              muted
              playsInline
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
