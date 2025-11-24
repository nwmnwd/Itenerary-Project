import React from "react";

import { SubscriptionModal } from "./SubscriptionModal.jsx";

export default {
  title: "Example/SubscriptionModal",
  component: SubscriptionModal,

  tags: ["autodocs"],

  argTypes: {
    isOpen: { control: "boolean" },
    plan: { control: "select", options: ["Basic", "Pro", "Premium"] },
    onClose: { action: "onClose clicked" },
    onSubscribe: { action: "onSubscribe clicked" },
  },
};

const Template = (args) => <SubscriptionModal {...args} />;

export const DefaultOpen = Template.bind({});
DefaultOpen.args = {
  isOpen: true,
  plan: "Pro",
  onClose: () => alert("Mock Close (Pro)"),
  onSubscribe: () => alert("Mock Subscribe (Pro)"),
};

export const PremiumPlan = Template.bind({});
PremiumPlan.args = {
  ...DefaultOpen.args,
  plan: "Premium",
  onClose: () => alert("Mock Close (Premium)"),
  onSubscribe: () => alert("Mock Subscribe (Premium)"),
};

export const Closed = Template.bind({});
Closed.args = {
  ...DefaultOpen.args,
  isOpen: false,
};
