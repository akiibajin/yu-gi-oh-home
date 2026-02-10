import { useEffect, useRef, useState } from "preact/hooks";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface QRScannerProps {
	onScan: (code: string) => void;
	onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const [isScanning, setIsScanning] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const startScanner = async () => {
			try {
				const scanner = new Html5Qrcode("qr-reader");
				scannerRef.current = scanner;

				await scanner.start(
					{ facingMode: "environment" },
					{
						fps: 10,
						qrbox: { width: 250, height: 250 },
					},
					(decodedText) => {
						// Successfully scanned
						onScan(decodedText);
						void stopScanner();
					},
					() => {
						// Scanning in progress (no action needed)
					},
				);

				setIsScanning(true);
			} catch (err) {
				console.error("Error starting scanner:", err);
				setError("Failed to access camera. Please check permissions.");
			}
		};

		const stopScanner = async () => {
			if (scannerRef.current && isScanning) {
				try {
					await scannerRef.current.stop();
					scannerRef.current.clear();
				} catch (err) {
					console.error("Error stopping scanner:", err);
				}
			}
		};

		void startScanner();

		return () => {
			void stopScanner();
		};
	}, []);

	const handleClose = async () => {
		if (scannerRef.current && isScanning) {
			try {
				await scannerRef.current.stop();
				scannerRef.current.clear();
			} catch (err) {
				console.error("Error stopping scanner:", err);
			}
		}
		onClose();
	};

	return (
		<div class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
			<Card class="w-full max-w-md">
				<CardHeader>
					<CardTitle>Scan QR Code</CardTitle>
					<CardDescription>
						Point your camera at the QR code displayed on the host's screen
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div id="qr-reader" class="w-full" />

					{error && <div class="text-sm text-red-500">{error}</div>}

					<Button variant="outline" onClick={handleClose} class="w-full">
						Cancel
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
