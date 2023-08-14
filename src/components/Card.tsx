import { ReactElement, ReactFragment } from "react";

const Card = (props: {
  title: string;
  children: ReactFragment | ReactElement;
  size?: string;
  center?: boolean;
}) => {
  let _s = props.size ?? "w-52";
  let center = props.center ?? true;

  return (
    <div className={`card mt-10 ${_s} bg-base-200 md:ml-12`}>
      <div className={`card-body items-center ${center ? "text-center" : ""}`}>
        <h2 className="card-title">{props.title}</h2>
        <div className="card-actions mt-4 justify-end">{props.children}</div>
      </div>
    </div>
  );
};

export default Card;
