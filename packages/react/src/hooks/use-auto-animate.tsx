import { useAutoAnimate as useFormkitAutoAnimate } from "@formkit/auto-animate/react";
import autoAnimate from "@formkit/auto-animate";

export type UseAutoAnimateOptions = {
  /**
   * The configuration options for auto-animate.
   */
  config?: Parameters<typeof autoAnimate>[1];
};

/**
 * A hook that provides an easy way to add auto-animate to a component.
 *
 * @see {@link https://auto-animate.formkit.com/|Auto Animate} for more information.
 *
 * Unlike the qwik twin (which returns a `{ ref, animationController }` pair of
 * signals), this React port returns the `[ref, setEnabled]` shape exposed by
 * `@formkit/auto-animate/react`, mapped onto a `{ ref, setEnabled }` object:
 * spread `ref` onto the container element, and call `setEnabled(boolean)` to
 * toggle the animation controller on or off.
 *
 * @example
 *   const Render = () => {
 *     const { ref } = useAutoAnimate();
 *     const [items, setItems] = useState([1, 2, 3, 4, 5]);
 *
 *     const handleShuffle = () => {
 *       setItems((prev) => [...prev].sort(() => Math.random() - 0.5));
 *     };
 *
 *     return (
 *       <div>
 *         <button onClick={handleShuffle}>Click me</button>
 *         <ul ref={ref}>
 *           {items.map((item) => (
 *             <li key={item}>Item {item}</li>
 *           ))}
 *         </ul>
 *       </div>
 *     );
 *   };
 */
export const useAutoAnimate = <T extends HTMLElement = HTMLElement>(
  options?: UseAutoAnimateOptions,
) => {
  const [ref, setEnabled] = useFormkitAutoAnimate<T>(options?.config);

  return { ref, setEnabled };
};
