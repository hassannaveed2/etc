"use server";

import { headers } from "next/headers";
import type { FormState } from "@/components/site/forms/FormShell";
import { getSettings } from "@/lib/content/settings";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getClientIp } from "@/lib/ip";
import { formatNotification, sendNotification } from "@/lib/mail";
import { formLimiter } from "@/lib/rate-limit";
import { contactInput, enquiryInput, processSubmission } from "@/lib/validation/forms";

async function context() {
  return { ip: getClientIp(await headers()), limiter: formLimiter, salt: getEnv().IP_HASH_SALT };
}

export async function submitEnquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  return processSubmission(fd, enquiryInput, {
    ...(await context()),
    store: async (d, ipHash) => {
      await prisma.enquiry.create({ data: { ...d, ipHash } });
    },
    notify: async (d) =>
      sendNotification({
        to: (await getSettings()).enquiryNotifyEmail,
        replyTo: d.email,
        subject: `New enquiry: ${d.organization}`,
        text: formatNotification([
          ["Organization", d.organization],
          ["Contact person", d.contactPerson],
          ["Official email", d.email],
          ["Phone", d.phone],
          ["Service", d.service],
          ["Estimated candidates", d.candidates],
          ["Timeline", d.timeline],
          ["Message", d.message],
        ]),
      }),
  });
}

export async function submitContact(_prev: FormState, fd: FormData): Promise<FormState> {
  return processSubmission(fd, contactInput, {
    ...(await context()),
    store: async (d, ipHash) => {
      await prisma.contactMessage.create({ data: { ...d, ipHash } });
    },
    notify: async (d) =>
      sendNotification({
        to: (await getSettings()).contactNotifyEmail,
        replyTo: d.email,
        subject: `New message: ${d.subject}`,
        text: formatNotification([
          ["Full name", d.name],
          ["Email", d.email],
          ["Subject", d.subject],
          ["Message", d.message],
        ]),
      }),
  });
}
