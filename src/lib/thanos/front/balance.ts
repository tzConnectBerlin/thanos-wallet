import * as React from "react";
import BigNumber from "bignumber.js";
import { useRetryableSWR } from "lib/swr";
import {
  ThanosAsset,
  useTezos,
  useSettings,
  fetchBalance,
  ReactiveTezosToolkit,
} from "lib/thanos/front";

type UseBalanceOptions = {
  suspense?: boolean;
  networkRpc?: string;
};

export function useBalance(
  asset: ThanosAsset,
  address: string,
  ops: UseBalanceOptions = {}
) {
  const nativeTezos = useTezos();
  const settings = useSettings();

  const tezos = React.useMemo(() => {
    if (ops.networkRpc) {
      const rpc = ops.networkRpc;
      return new ReactiveTezosToolkit(
        rpc,
        rpc,
        settings.lambdaContracts?.[rpc]
      );
    }
    return nativeTezos;
  }, [ops.networkRpc, nativeTezos, settings.lambdaContracts]);

  const fetchBalanceLocal = React.useCallback(
    () => fetchBalance(tezos, asset, address),
    [tezos, asset, address]
  );

  const swrKey = React.useMemo(
    () => ["balance", tezos.checksum, asset.symbol, address],
    [tezos.checksum, asset.symbol, address]
  );

  const swrKeyString = React.useMemo(() => swrKey.join("_"), [swrKey]);

  const initialData = React.useMemo(() => {
    const val = localStorage.getItem(swrKeyString);
    return val ? new BigNumber(val) : undefined;
  }, [swrKeyString]);

  const onSuccess = React.useCallback(
    (data: BigNumber) => {
      localStorage.setItem(swrKeyString, data.toString());
    },
    [swrKeyString]
  );

  return useRetryableSWR(swrKey, fetchBalanceLocal, {
    suspense: ops.suspense ?? true,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    dedupingInterval: 20_000,
    initialData,
    onSuccess,
  });
}
