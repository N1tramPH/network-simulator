<script setup></script>

<template>
  <div
    class="h-[28rem] h-max-[70vh] w-[40rem] overflow-y-scroll p-4 space-y-4 dark:text-gray-200"
  >
    <div>
      <h3 class="font-medium my-2">Motivation</h3>
      <p class="leading-7">
        This project serves as the practical component of my Bachelor's Thesis
        completed at Palacký University Olomouc. Its objective is to design and
        develop a user-friendly virtual computer network simulator based on
        TCP/IP protocols that would aid the understanding of fundamental
        principles in computer network communication.
      </p>
    </div>

    <div>
      <h3 class="font-medium my-2 mt-4 inline">Author:</h3>
      <span> Thanh Tú Phan</span>
    </div>

    <div>
      <h3 class="font-medium my-2 mt-4 inline">Contact:</h3>
      <a
        href="mailto:phanth01@upol.cz"
        class="font-medium text-cyan-900 dark:text-cyan-500 hover:text-cyan-700"
      >
        phanth01@upol.cz
      </a>
      <span class="block text-sm ml-4"> &#8594; for found errors </span>
    </div>

    <div>
      <h3 class="font-medium my-2 mt-4">Testing exports:</h3>

      <span class="block text-sm mb-2">
        Preconfigured topologies that can be simply imported via section on a
        sidebar
      </span>

      <ul class="list-disc pl-6 space-y-3">
        <li>
          <a
            class="flex items-center gap-2 hover:opacity-75"
            href="https://drive.google.com/uc?export=download&id=1-EZezXFaFi0pOQjQ1sog4jpXTDb7rSPw"
            title="Click to download"
            download
          >
            Small network topology
            <svg
              class="w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
            >
              <path
                fill="currentColor"
                d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8"
              />
            </svg>
          </a>
          <span class="text-sm"
            >(PC1, PC2, PC4, P5 having default gateways set)</span
          >
        </li>

        <li>
          <a
            class="flex items-center gap-2 hover:opacity-75"
            href="https://drive.google.com/uc?export=download&id=1g0CX-U1J5GJk32wjYbfJDIN3F7E5--xx"
            title="Click to download"
            download
          >
            A topology from POS1 ex.8.1
            <svg
              class="w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
            >
              <path
                fill="currentColor"
                d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8"
              />
            </svg>
          </a>
          <span class="text-sm"> (with no routes nor ARP set) </span>
        </li>

        <li>
          <a
            class="flex items-center gap-2 hover:opacity-75"
            href="https://drive.google.com/uc?export=download&id=1-6n6-yZ0bfWFju07xDOoGQDwyyH6gc_G"
            title="Click to download"
            download
          >
            POS1 ex.8.2
            <svg
              class="w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
            >
              <path
                fill="currentColor"
                d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8"
              />
            </svg>
          </a>
          <span class="text-sm">(with routes+ARP set)</span>
        </li>

        <li>
          <a
            class="flex items-center gap-2 hover:opacity-75"
            href="https://drive.google.com/uc?export=download&id=1mLTnXmOTHDkU2q3Hq-x14TF39GoMl2ck"
            title="Click to download"
            download
          >
            POS1 ex.8.2
            <svg
              class="w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
            >
              <path
                fill="currentColor"
                d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8"
              />
            </svg>
          </a>
          <span class="text-sm">(with routes but no ARP set)</span>
        </li>

        <li>
          <a
            class="flex items-center gap-2 hover:opacity-75"
            href="https://drive.google.com/uc?export=download&id=1489WEBBrH73CqCJ_9Xt0Z023YA_s2lg3"
            title="Click to download"
            download
          >
            POS1 ex.8.3
            <svg
              class="w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
            >
              <path
                fill="currentColor"
                d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8"
              />
            </svg>
          </a>
          <span class="text-sm">
            (with routes+arp set but with changed gateway on R1)
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
h3 {
  @apply dark:text-white;
}
</style>
