"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleX } from "lucide-react";

const PaymentFailure = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const encodedData = searchParams.get("data");

    if (encodedData) {
      try {
        const decodedData = atob(encodedData);
        const parsedData = JSON.parse(decodedData);
        console.log(parsedData);
        setData(parsedData);
      } catch (error) {
        console.error("Error decoding failure data:", error);
      }
    }
  }, [searchParams]);

  return (
    <div className="payment-failure-container">
      <div className="payment-failure-card">
        <CircleX className="failure-icon" />
        <h2 className="failure-message">Payment Failed</h2>
        <p className="error-message">
          Unfortunately, your payment was not processed. Please try again or
          contact support for assistance.
        </p>
        <a href="/checkout" className="text-black hover:underline mt-5">Go back</a>
      </div>
    </div>
  );
};

export default PaymentFailure;
