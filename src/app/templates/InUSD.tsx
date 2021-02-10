import * as React from "react";
import BigNumber from "bignumber.js";
import {
  TempleAsset,
  TempleAssetType,
  XTZ_ASSET,
  useUSDPrice,
} from "lib/temple/front";
import Money from "app/atoms/Money";

type InUSDProps = {
  volume: BigNumber | number | string;
  asset?: TempleAsset;
  children: (usdVolume: React.ReactNode) => React.ReactElement;
  roundingMode?: BigNumber.RoundingMode;
};

const InUSD: React.FC<InUSDProps> = ({
  volume,
  asset = XTZ_ASSET,
  children,
  roundingMode,
}) => {
  const price = useUSDPrice();
  return asset.type === TempleAssetType.XTZ && price !== null
    ? children(
        <Money fiat roundingMode={roundingMode}>
          {new BigNumber(volume).times(price)}
        </Money>
      )
    : null;
};

export default InUSD;
