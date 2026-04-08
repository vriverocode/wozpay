import { defineStore } from "pinia";
import ApiService from "@/services/axios/";
import JwtService from "@/services/jwt/";

export const useWithdrawalStore = defineStore("withdrawal", {
    actions: {
        async allWithdrawalByUser(userId) {
            return await new Promise((resolve) => {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                    ApiService.get("/api/withdrawal/all")
                        .then(({ data }) => {
                            if (data.code !== 200) {
                                throw data;
                            }
                            resolve(data);
                        })
                        .catch((response) => {
                            console.log(response);
                            resolve("Error al solicitar prestamo.");
                        });
                }
            }).catch((response) => {
                console.log(response);
                return "Error al actualizar datos";
            });
        },
        async getWithdrawal(withdrawalId) {
            return await new Promise((resolve) => {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                    ApiService.get("/api/withdrawal/u/" + withdrawalId)
                        .then(({ data }) => {
                            if (data.code !== 200) {
                                throw data;
                            }
                            resolve(data);
                        })
                        .catch((response) => {
                            console.log(response);
                            resolve("Error al solicitar prestamo.");
                        });
                }
            }).catch((response) => {
                console.log(response);
                return "Error al actualizar datos";
            });
        },
        async createWithdrawal(data) {
            return await new Promise((resolve) => {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                    ApiService.post("/api/withdrawal", data)
                        .then(({ data }) => {
                            if (data.code !== 200) {
                                throw data;
                            }
                            resolve(data);
                        })
                        .catch((response) => {
                            console.log(response);
                            resolve("Error al procesar withdrawalencia.");
                        });
                }
            }).catch((response) => {
                console.log(response);
                return "Error al actualizar datos";
            });
        },
        async getWithdrawalBalances() {
          return await new Promise((resolve, reject) => {
            if (JwtService.getToken()) {
              ApiService.setHeader();
              ApiService.get("/api/withdrawal/balances/")
                  .then(({ data }) => {
                      if (data.code !== 200) {
                          throw data;
                      }
                      resolve(data.data);
                  })
                  .catch((error) => {
                      console.log(error);
                      reject("Error al obtener los balances disponibles.");
                  });
            }
          });
        },
        async hasPendingWithdrawal() {
            return await new Promise((resolve) => {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                    ApiService.get("/api/withdrawal/pending")
                        .then(({ data }) => {
                            if (data.code !== 200) {
                                throw data;
                            }
                            resolve(data.data);
                        })
                        .catch((response) => {
                            console.log(response);
                            resolve(null);
                        });
                } else {
                    resolve(null);
                }
            }).catch((response) => {
                console.log(response);
                return null;
            });
        },
    },
    getters: {},
});