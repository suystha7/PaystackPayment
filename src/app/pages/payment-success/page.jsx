"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheckBig } from "lucide-react";

const PaymentSuccess = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState({});

  useEffect(() => {
    const encodedData = searchParams.get("data");
    if (encodedData) {
      try {
        const resData = atob(encodedData);
        const resObject = JSON.parse(resData);
        console.log(resObject);
        setData(resObject);
      } catch (error) {
        console.error("Invalid data format", error);
      }
    }
  }, [searchParams]);

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <CircleCheckBig className="success-icon" />
        <h2 className="success-message">Payment Successful</h2>
        <p className="amount">
          <strong>Amount Paid: </strong>Rs. {data.total_amount}
        </p>
        <p className="transaction-id">
          <strong>Transaction ID: </strong>
          {data.transaction_uuid}
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
