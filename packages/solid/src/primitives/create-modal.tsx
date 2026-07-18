import { createSignal, type Accessor, type ParentComponent } from "solid-js";

import { ElmModal } from "../components/containments/elm-modal";

export interface CreateModalOptions {
  /** Delay in milliseconds of the open/close fade animation. */
  delay?: number;
}

export interface CreateModalReturn {
  Modal: ParentComponent;
  isOpen: Accessor<boolean>;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

/** Creates imperative controls and a stable native-dialog component. */
export const createModal = (
  options: CreateModalOptions = {},
): CreateModalReturn => {
  const [isOpen, setIsOpen] = createSignal(false);

  const show = () => setIsOpen(true);
  const hide = () => setIsOpen(false);
  const toggle = () => setIsOpen((open) => !open);

  const Modal: ParentComponent = (props) => (
    <ElmModal isOpen={isOpen()} delay={options.delay} onClose={hide}>
      {props.children}
    </ElmModal>
  );

  return { Modal, isOpen, show, hide, toggle };
};
