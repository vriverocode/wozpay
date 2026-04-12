import { defineStore } from "pinia";
import ApiService from "@/services/axios/";
import JwtService from "@/services/jwt/";

export const useCardStore = defineStore("card", {
    actions: {
        async getCard(userId) {
            return await new Promise((resolve) => {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                    ApiService.get("/api/card/" + userId)
                        .then(({ data }) => {
                            if (data.code !== 200) {
                                throw data;
                            }
                            resolve(data);
                        })
                        .catch((response) => {
                            console.log(response);
                            resolve("Error al obtener tarjeta vinculada");
                        });
                }
            }).catch((response) => {
                console.log(response);
                return "Error al actualizar datos";
            });
        },
        async deleteCard(cardId) {
            return await new Promise((resolve) => {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                    ApiService.post("/api/card/delete/" + cardId)
                        .then(({ data }) => {
                            if (data.code !== 200) {
                                throw data;
                            }
                            resolve(data);
                        })
                        .catch((response) => {
                            console.log(response);
                            resolve("Error al eliminar tarjeta vinculada");
                        });
                }
            }).catch((response) => {
                console.log(response);
                return "Error al actualizar datos";
            });
        },
        async linkCard(payload) {
            return await new Promise((resolve, reject) => {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                    ApiService.post("/api/card", payload)
                        .then(({ data }) => {
                            if (data.code !== 200) {
                                // Si el backend retorna error de saldo o validación
                                resolve(data);
                            } else {
                                resolve(data);
                            }
                        })
                        .catch((error) => {
                            console.error("Error linking card:", error);
                            resolve({
                                code: 500,
                                message:
                                    "Error interno al procesar la vinculación.",
                            });
                        });
                }
            });
        },
        async updateStatusCard(data) {
            return new Promise((resolve) => {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                    ApiService.post("/api/card/changeStatus/" + data.id, data)
                        .then(({ data }) => {
                            if (data.code !== 200) {
                                throw data;
                            }
                            resolve(data);
                        })
                        .catch((response) => {
                            resolve("Error cambiar estado de la tarjeta.");
                        });
                }
            });
        },
    },
    getters: {},
});