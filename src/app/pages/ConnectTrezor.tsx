import classNames from "clsx";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { T, t } from "lib/i18n/react";
import {
  ThanosAccountType,
  useAllAccounts,
  useSetAccountPkh,
  useThanosClient,
  validateDerivationPath,
} from "lib/thanos/front";
import { navigate } from "lib/woozie";
import PageLayout from "app/layouts/PageLayout";
import Alert from "app/atoms/Alert";
import FormField from "app/atoms/FormField";
import { ReactComponent as OkIcon } from "app/icons/ok.svg";
import FormSubmitButton from "app/atoms/FormSubmitButton";
import ConfirmTrezorOverlay from "app/atoms/ConfirmTrezorOverlay";
import TrezorConnect from "trezor-connect";
import { browser } from "webextension-polyfill-ts";

type FormData = {
  name: string;
  customDerivationPath: string;
};

const DERIVATION_PATHS = [
  {
    type: "default",
    name: "Default account",
  },
  {
    type: "custom",
    name: "Custom derivation path",
  },
];

const ConnectTrezor: React.FC = () => {
  const allAccounts = useAllAccounts();
  const setAccountPkh = useSetAccountPkh();

  const allTrezors = useMemo(
    () => allAccounts.filter((acc) => acc.type === ThanosAccountType.Trezor),
    [allAccounts]
  );

  const defaultName = useMemo(
    () => t("defaultTrezorName", String(allTrezors.length + 1)),
    [allTrezors.length]
  );

  const prevAccLengthRef = useRef(allAccounts.length);
  useEffect(() => {
    const accLength = allAccounts.length;
    if (prevAccLengthRef.current < accLength) {
      setAccountPkh(allAccounts[accLength - 1].publicKeyHash);
      navigate("/");
    }
    prevAccLengthRef.current = accLength;
  }, [allAccounts, setAccountPkh]);

  const { register, handleSubmit, errors, formState } = useForm<FormData>({
    defaultValues: {
      name: defaultName,
      customDerivationPath: "m/44'/1729'/0'/0'",
    },
  });
  const submitting = formState.isSubmitting;

  const [error, setError] = useState<React.ReactNode>(null);
  const [derivationPath, setDerivationPath] = useState(DERIVATION_PATHS[0]);

  const onSubmit = useCallback(
    async ({ name, customDerivationPath }: FormData) => {
      if (submitting) return;
      setError(null);

      try {
        await TrezorConnect.init({
          manifest: {
            email: "keshan3262@gmail.com",
            appUrl: window.location.href,
          },
        });
        const result = await TrezorConnect.requestLogin({
          challengeHidden: "0123456789abcdef",
          challengeVisual: "Login to",
        });

        console.log(result);
        // await createTrezorAccount(name, customDerivationPath);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error(err);
        }

        // Human delay.
        await new Promise((res) => setTimeout(res, 300));
        setError(err.message);
      }
    },
    [submitting, setError]
  );

  return (
    <PageLayout
      pageTitle={
        <T id="connectTrezor">
          {(message) => (
            <>
              <img
                alt="Trezor logo"
                src={browser.runtime.getURL("/misc/logo.png")}
                className="w-auto h-4 mr-1 stroke-current"
              />
              {message}
            </>
          )}
        </T>
      }
    >
      <div className="relative w-full">
        <div className="w-full max-w-sm mx-auto mt-6 mb-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert
                type="error"
                title={t("error")}
                autoFocus
                description={error}
                className="mb-6"
              />
            )}

            <FormField
              ref={register({
                pattern: {
                  value: /^[a-zA-Z0-9 _-]{0,16}$/,
                  message: t("trezorNameConstraint"),
                },
              })}
              label={t("accountName")}
              labelDescription={t("trezorNameInputDescription")}
              id="create-trezor-name"
              type="text"
              name="name"
              placeholder={defaultName}
              errorCaption={errors.name?.message}
              containerClassName="mb-4"
            />

            <div className={classNames("mb-4", "flex flex-col")}>
              <h2
                className={classNames("mb-4", "leading-tight", "flex flex-col")}
              >
                <span className="text-base font-semibold text-gray-700">
                  <T id="derivation" />{" "}
                  <T id="optionalComment">
                    {(message) => (
                      <span className="text-sm font-light text-gary-600">
                        {message}
                      </span>
                    )}
                  </T>
                </span>

                <span
                  className={classNames(
                    "mt-1",
                    "text-xs font-light text-gray-600"
                  )}
                  style={{ maxWidth: "90%" }}
                >
                  <T
                    id="defaultDerivationPathLabel"
                    substitutions={[<b>44'/1729'/0'/0'</b>]}
                  />
                  <br />
                  <T id="clickOnCustomDerivationPath" />
                </span>
              </h2>
              <div
                className={classNames(
                  "rounded-md overflow-hidden",
                  "border-2 bg-gray-100",
                  "flex flex-col",
                  "text-gray-700 text-sm leading-tight"
                )}
              >
                {DERIVATION_PATHS.map((dp, i, arr) => {
                  const last = i === arr.length - 1;
                  const selected = derivationPath.type === dp.type;
                  const handleClick = () => {
                    setDerivationPath(dp);
                  };

                  return (
                    <button
                      key={dp.type}
                      type="button"
                      className={classNames(
                        "block w-full",
                        "overflow-hidden",
                        !last && "border-b border-gray-200",
                        selected
                          ? "bg-gray-300"
                          : "hover:bg-gray-200 focus:bg-gray-200",
                        "flex items-center",
                        "text-gray-700",
                        "transition ease-in-out duration-200",
                        "focus:outline-none",
                        "opacity-90 hover:opacity-100"
                      )}
                      style={{
                        padding: "0.4rem 0.375rem 0.4rem 0.375rem",
                      }}
                      onClick={handleClick}
                    >
                      {dp.name}
                      <div className="flex-1" />
                      {selected && (
                        <OkIcon
                          className={classNames("mx-2 h-4 w-auto stroke-2")}
                          style={{
                            stroke: "#777",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {derivationPath.type === "custom" && (
              <FormField
                ref={register({
                  required: t("required"),
                  validate: validateDerivationPath,
                })}
                name="customDerivationPath"
                id="importacc-cdp"
                label={t("customDerivationPath")}
                placeholder={t("derivationPathExample2")}
                errorCaption={errors.customDerivationPath?.message}
                containerClassName="mb-6"
              />
            )}

            <T id="addTrezorAccount">
              {(message) => (
                <FormSubmitButton loading={submitting} className="mt-8">
                  {message}
                </FormSubmitButton>
              )}
            </T>
          </form>
        </div>

        <ConfirmTrezorOverlay displayed={submitting} />

        {/*process.env.TARGET_BROWSER === "firefox" && (
          <div
            className={classNames(
              "absolute inset-0",
              "bg-white bg-opacity-90",
              "p-4",
              "flex flex-col items-center justify-center"
            )}
          >
            <h1
              className={classNames(
                "mb-8",
                "text-center",
                "text-xl font-medium tracking-tight text-gray-600"
              )}
            >
              <T
                id="firefoxLedgerConnectionError"
                substitutions={[
                  <T id="sorry" key="sorry">
                    {(message) => (
                      <span className="text-gray-700">{message}</span>
                    )}
                  </T>,
                  <T id="ledgerNano" key="ledgerNano">
                    {(message) => (
                      <span className="text-gray-700">{message}</span>
                    )}
                  </T>,
                  <span className="text-gray-700" key="firefox">
                    Firefox
                  </span>,
                  <T id="connectionUnavailable" key="connectionUnavailable">
                    {(message) => (
                      <span className="text-gray-700">{message}</span>
                    )}
                  </T>,
                ]}
              >
                {(message) => (
                  <span className="text-base font-normal">{message}</span>
                )}
              </T>
            </h1>
          </div>
                ) */}
      </div>
    </PageLayout>
  );
};

export default ConnectTrezor;
