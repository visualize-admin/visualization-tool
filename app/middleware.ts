import { NextMiddleware, NextResponse } from "next/server";

const middleware: NextMiddleware = function ({ nextUrl }) {
  const response = NextResponse.next();
  return response;
};

export default middleware;
