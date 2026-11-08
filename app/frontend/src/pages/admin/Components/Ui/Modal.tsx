import type { ComponentProps } from "react";
import Dialog from "./Dialog";

// Admin adapter: leave the shared Public/Teacher/Student Modal unchanged.
export default function Modal(props: ComponentProps<typeof Dialog>) {
  return props.open ? <Dialog {...props}/> : null;
}
