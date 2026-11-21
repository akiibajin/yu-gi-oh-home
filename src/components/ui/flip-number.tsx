import NumberFlow from "@number-flow/react";
import { FC } from "react";

interface FlipNumberProps {
  number: number;
}

const FlipNumberComponent: FC<FlipNumberProps> = ({ number }) => {
  return <NumberFlow value={number} />;
};

export default FlipNumberComponent;
