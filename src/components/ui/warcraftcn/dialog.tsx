import { XIcon } from "lucide-react";
import { createContext } from "preact";
import { cloneElement } from "preact";
import { useContext, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { createPortal } from "preact/compat";

import { cn } from "@/lib/utils";
import type { ComponentProps, ComponentChildren, VNode } from "preact";

type DialogContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
	titleId: string | null;
	setTitleId: (id: string | null) => void;
	descriptionId: string | null;
	setDescriptionId: (id: string | null) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

let dialogIdCounter = 0;
let scrollLockCount = 0;
let previousBodyOverflow: string | null = null;

function useDialogContext(componentName: string) {
	const ctx = useContext(DialogContext);
	if (!ctx) {
		throw new Error(`${componentName} must be used within <Dialog>`);
	}
	return ctx;
}

function getFocusableElements(container: HTMLElement) {
	const selector =
		"a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), details summary, [tabindex]:not([tabindex='-1'])";
	return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
		(el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
	);
}

function lockBodyScroll() {
	if (typeof document === "undefined") return;
	scrollLockCount += 1;
	if (scrollLockCount !== 1) return;
	previousBodyOverflow = document.body.style.overflow;
	document.body.style.overflow = "hidden";
}

function unlockBodyScroll() {
	if (typeof document === "undefined") return;
	scrollLockCount = Math.max(0, scrollLockCount - 1);
	if (scrollLockCount !== 0) return;
	if (previousBodyOverflow === null) {
		document.body.style.overflow = "";
	} else {
		document.body.style.overflow = previousBodyOverflow;
	}
	previousBodyOverflow = null;
}

type DialogProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: ComponentChildren;
};

function Dialog({
	open,
	defaultOpen = false,
	onOpenChange,
	children,
}: DialogProps) {
	const isControlled = open !== undefined;
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const [titleId, setTitleId] = useState<string | null>(null);
	const [descriptionId, setDescriptionId] = useState<string | null>(null);

	const actualOpen = isControlled ? (open as boolean) : uncontrolledOpen;
	const setOpen = (next: boolean) => {
		if (!isControlled) setUncontrolledOpen(next);
		onOpenChange?.(next);
	};

	const value = useMemo<DialogContextValue>(
		() => ({
			open: actualOpen,
			setOpen,
			titleId,
			setTitleId,
			descriptionId,
			setDescriptionId,
		}),
		[actualOpen, titleId, descriptionId],
	);

	useEffect(() => {
		if (!actualOpen) return;
		lockBodyScroll();
		return () => {
			unlockBodyScroll();
		};
	}, [actualOpen]);

	return (
		<DialogContext.Provider value={value}>
			<div data-slot="dialog">{children}</div>
		</DialogContext.Provider>
	);
}

type AsChildProps = {
	asChild?: boolean;
	children?: ComponentChildren;
};

function DialogTrigger({
	asChild,
	children,
	...props
}: AsChildProps & ComponentProps<"button">) {
	const { setOpen } = useDialogContext("DialogTrigger");
	const onClick: ComponentProps<"button">["onClick"] = (e) => {
		props.onClick?.(e);
		if ((e as unknown as MouseEvent).defaultPrevented) return;
		setOpen(true);
	};

	if (asChild && children) {
		return cloneElement(children as VNode, {
			...props,
			onClick,
			"data-slot": "dialog-trigger",
		});
	}

	return (
		<button
			data-slot="dialog-trigger"
			type="button"
			{...props}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

function DialogClose({
	asChild,
	children,
	...props
}: AsChildProps & ComponentProps<"button">) {
	const { setOpen } = useDialogContext("DialogClose");
	const onClick: ComponentProps<"button">["onClick"] = (e) => {
		props.onClick?.(e);
		if ((e as unknown as MouseEvent).defaultPrevented) return;
		setOpen(false);
	};

	if (asChild && children) {
		return cloneElement(children as VNode, {
			...props,
			onClick,
			"data-slot": "dialog-close",
		});
	}

	return (
		<button data-slot="dialog-close" type="button" {...props} onClick={onClick}>
			{children}
		</button>
	);
}

function DialogPortal({ children }: { children: ComponentChildren }) {
	const { open } = useDialogContext("DialogPortal");
	if (!open) return null;
	if (typeof document === "undefined") return null;
	return createPortal(
		<div data-slot="dialog-portal">{children}</div>,
		document.body,
	);
}

function DialogOverlay({ className, ...props }: ComponentProps<"div">) {
	const { open, setOpen } = useDialogContext("DialogOverlay");
	if (!open) return null;
	return (
		<div
			data-slot="dialog-overlay"
			className={cn("fixed inset-0 z-50 bg-black/50", className)}
			onMouseDown={(e) => {
				props.onMouseDown?.(e);
				if (e.defaultPrevented) return;
				if (e.target === e.currentTarget) setOpen(false);
			}}
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: ComponentProps<"div"> & {
	showCloseButton?: boolean;
}) {
	const { open, setOpen, titleId, descriptionId } =
		useDialogContext("DialogContent");
	const contentRef = useRef<HTMLDivElement | null>(null);
	const previouslyFocusedRef = useRef<Element | null>(null);
	const localContentId = useRef(`dialog-content-${(dialogIdCounter += 1)}`);

	useEffect(() => {
		if (!open) return;
		if (typeof document === "undefined") return;
		previouslyFocusedRef.current = document.activeElement;

		// Focus first focusable element, otherwise focus the content container.
		const node = contentRef.current;
		if (node) {
			const focusables = getFocusableElements(node);
			if (focusables[0]) {
				focusables[0].focus();
			} else {
				node.focus();
			}
		}

		return () => {
			const prev = previouslyFocusedRef.current as HTMLElement | null;
			if (prev?.focus) prev.focus();
			previouslyFocusedRef.current = null;
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				setOpen(false);
				return;
			}
			if (e.key !== "Tab") return;

			const node = contentRef.current;
			if (!node) return;
			const focusables = getFocusableElements(node);
			if (focusables.length === 0) {
				e.preventDefault();
				node.focus();
				return;
			}
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			const active = document.activeElement as HTMLElement | null;
			if (e.shiftKey) {
				if (!active || active === first || !node.contains(active)) {
					e.preventDefault();
					last.focus();
				}
			} else {
				if (!active || active === last || !node.contains(active)) {
					e.preventDefault();
					first.focus();
				}
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open, setOpen]);

	if (!open) return null;

	return (
		<DialogPortal>
			<DialogOverlay />
			<div
				data-slot="dialog-content"
				ref={contentRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId ?? undefined}
				aria-describedby={descriptionId ?? undefined}
				id={localContentId.current}
				tabIndex={-1}
				className={cn(
					"bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<button
						data-slot="dialog-close"
						type="button"
						onClick={() => setOpen(false)}
						className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
					>
						<XIcon />
						<span className="sr-only">Close</span>
					</button>
				)}
			</div>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

function DialogFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

function DialogTitle({ className, ...props }: ComponentProps<"h2">) {
	const { setTitleId } = useDialogContext("DialogTitle");
	const idRef = useRef(`dialog-title-${(dialogIdCounter += 1)}`);
	useEffect(() => {
		setTitleId(idRef.current);
		return () => {
			setTitleId(null);
		};
	}, [setTitleId]);
	return (
		<h2
			data-slot="dialog-title"
			id={idRef.current}
			className={cn("text-lg leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function DialogDescription({ className, ...props }: ComponentProps<"p">) {
	const { setDescriptionId } = useDialogContext("DialogDescription");
	const idRef = useRef(`dialog-description-${(dialogIdCounter += 1)}`);
	useEffect(() => {
		setDescriptionId(idRef.current);
		return () => {
			setDescriptionId(null);
		};
	}, [setDescriptionId]);
	return (
		<p
			data-slot="dialog-description"
			id={idRef.current}
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
