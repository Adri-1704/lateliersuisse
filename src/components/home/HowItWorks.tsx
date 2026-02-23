import { useTranslations } from "next-intl";
import { Search, BookOpen, Utensils } from "lucide-react";

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  const steps = [
    {
      icon: Search,
      title: t("step1Title"),
      description: t("step1Desc"),
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: BookOpen,
      title: t("step2Title"),
      description: t("step2Desc"),
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: Utensils,
      title: t("step3Title"),
      description: t("step3Desc"),
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl sm:h-20 sm:w-20">
                <div className={`flex h-full w-full items-center justify-center rounded-2xl ${step.color}`}>
                  <step.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-just-tag)] text-xs font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
