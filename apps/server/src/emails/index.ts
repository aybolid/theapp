import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  from: process.env.FROM_EMAIL,
  host: "localhost",
  port: 1025,
});
