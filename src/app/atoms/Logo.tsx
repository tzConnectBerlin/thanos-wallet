import * as React from "react";
import classNames from "clsx";
import logoUrl from "app/misc/logo.png";
import whiteLogoUrl from "app/misc/logo-white.png";

type LogoProps = React.HTMLAttributes<HTMLDivElement> & {
  hasTitle?: boolean;
  darkTitle?: boolean;
  whiteLogo?: boolean;
  imgStyle?: React.CSSProperties;
};

const Logo: React.FC<LogoProps> = ({
  hasTitle,
  darkTitle,
  whiteLogo,
  className,
  imgStyle = {},
  ...rest
}) => (
  <div className={classNames("flex items-center", className)} {...rest}>
    <img
      src={whiteLogo ? whiteLogoUrl : logoUrl}
      alt="Temple Wallet"
      style={{
        height: 40,
        width: "auto",
        marginTop: 6,
        marginBottom: 6,
        ...imgStyle,
      }}
    />

    {hasTitle && (
      <span
        className={classNames(
          "ml-2",
          "text-xl font-semibold tracking-tight",
          darkTitle ? "text-gray-600" : "text-white"
        )}
      >
        Temple
      </span>
    )}
  </div>
);

export default Logo;
