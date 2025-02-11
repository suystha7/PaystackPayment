"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

const Checkout = () => {
  const [formData, setFormData] = useState({
    transaction_uuid: uuidv4(),
    secret: process.env.NEXT_PUBLIC_SECRET_KEY,
    product_code: "EPAYTEST",
    success_url: "http://localhost:3000/pages/payment-success",
    failure_url: "http://localhost:3000/pages/payment-failure",
    tax_amount: "0",
    total_amount: "100",
  });

  const generateSignature = (
    total_amount,
    transaction_uuid,
    product_code,
    secret
  ) => {
    const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = CryptoJS.HmacSHA256(hashString, secret);
    return CryptoJS.enc.Base64.stringify(hash);
  };

  const formik = useFormik({
    initialValues: {
      amount: "",
      first_name: "",
      last_name: "",
      total_amount: "100",
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .required("Amount is required")
        .positive("Amount must be greater than 0"),
      first_name: Yup.string().required("First name is required"),
      last_name: Yup.string().required("Last name is required"),
    }),
    onSubmit: (values) => {
      const hashedSignature = generateSignature(
        values.total_amount,
        formData.transaction_uuid,
        formData.product_code,
        formData.secret
      );

      setFormData((prevState) => ({
        ...prevState,
        ...values,
        signature: hashedSignature,
        total_amount: values.amount,
      }));

      handlePaystackRedirect(values.amount);
    },
  });

  const handlePaystackRedirect = (amount) => {
    if (!window.Paystack) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => initializePayment(amount);
      document.body.appendChild(script);
    } else {
      initializePayment(amount);
    }
  };

  const initializePayment = (amount) => {
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PUBLIC_KEY,
      email: "suyog.tukilogic@gmail.com",
      amount: amount * 100,
      currency: "NGN",
      ref: formData.transaction_uuid,
      firstname: formik.values.first_name,
      lastname: formik.values.last_name,
      callback: function (response) {
        const paymentData = {
          total_amount: amount,
          transaction_uuid: response.reference,
          status: "success",
        };

        const encodedData = btoa(JSON.stringify(paymentData));
        window.location.href = `${formData.success_url}?data=${encodedData}`;
      },

      onClose: function () {
        const failureData = {
          transaction_uuid: formData.transaction_uuid,
          status: "failed",
        };

        const encodedFailureData = btoa(JSON.stringify(failureData));
        const redirectUrl = `${formData.failure_url}?data=${encodedFailureData}`;

        console.log("Redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
      },
    });

    handler.openIframe();
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto mt-10"
    >
      <h1 className="text-center text-3xl font-bold text-gray-800 mb-6">
        Checkout
      </h1>

      <div className="mb-6">
        <label htmlFor="amount" className="block text-gray-700 text-lg mb-2">
          Amount
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          value={formik.values.amount}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-3 border-2 border-gray-300 rounded-lg"
        />
        {formik.touched.amount && formik.errors.amount && (
          <div className="text-red-500 text-sm mt-1">
            {formik.errors.amount}
          </div>
        )}
      </div>

      <div className="mb-6">
        <label
          htmlFor="first_name"
          className="block text-gray-700 text-lg mb-2"
        >
          First Name
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formik.values.first_name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-3 border-2 border-gray-300 rounded-lg"
        />
        {formik.touched.first_name && formik.errors.first_name && (
          <div className="text-red-500 text-sm mt-1">
            {formik.errors.first_name}
          </div>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="last_name" className="block text-gray-700 text-lg mb-2">
          Last Name
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formik.values.last_name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-3 border-2 border-gray-300 rounded-lg"
        />
        {formik.touched.last_name && formik.errors.last_name && (
          <div className="text-red-500 text-sm mt-1">
            {formik.errors.last_name}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-black text-white text-lg font-semibold rounded-lg"
      >
        Pay via Paystack
      </button>
    </form>
  );
};

export default Checkout;
