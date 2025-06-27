import { NextResponse } from "next/server";

interface ShippingOption {
  service: string;
  serviceName: string;
  shippingValue: number;
  shippingDays: number;
}

interface ShippingResponse {
  success: boolean;
  options: ShippingOption[];
  error?: string;
}

export async function POST(request: Request) {
  try {
    const { cep } = await request.json();

    if (!cep || cep.length !== 8) {
      return NextResponse.json(
        { success: false, error: "CEP inválido" },
        { status: 400 }
      );
    }

    // CEP de origem (onde o produto será enviado de)
    const originCep = "11085755"; // CEP fornecido: 11085-755

    // Peso do produto em gramas (HD 1TB + embalagem)
    const weight = 0.5; // 500g em kg

    // Dimensões do produto (comprimento x largura x altura em cm)
    const length = 15;
    const width = 10;
    const height = 2;

    // Calcular frete usando Melhor Envio
    const melhorEnvioData = await calculateMelhorEnvioShipping(
      originCep,
      cep,
      weight,
      length,
      width,
      height
    );

    if (melhorEnvioData.success) {
      console.log("✅ Frete calculado com sucesso via Melhor Envio");
      return NextResponse.json({
        success: true,
        options: melhorEnvioData.options,
      });
    }

    // Fallback: fretes padrão caso a Melhor Envio falhe
    console.log("⚠️ Melhor Envio falhou, usando valores padrão de fallback");
    return NextResponse.json({
      success: true,
      options: [
        {
          service: "40010",
          serviceName: "SEDEX",
          shippingValue: 3500, // R$ 35,00 em centavos
          shippingDays: 3,
        },
        {
          service: "04510",
          serviceName: "PAC",
          shippingValue: 2500, // R$ 25,00 em centavos
          shippingDays: 7,
        },
      ],
    });
  } catch (error) {
    console.error("❌ Erro geral ao calcular frete:", error);

    // Fallback em caso de erro
    console.log("🔄 Usando valores de fallback devido a erro geral");
    return NextResponse.json({
      success: true,
      options: [
        {
          service: "40010",
          serviceName: "SEDEX",
          shippingValue: 3500, // R$ 35,00 em centavos
          shippingDays: 3,
        },
        {
          service: "04510",
          serviceName: "PAC",
          shippingValue: 2500, // R$ 25,00 em centavos
          shippingDays: 7,
        },
      ],
    });
  }
}

async function calculateMelhorEnvioShipping(
  originCep: string,
  destinationCep: string,
  weight: number,
  length: number,
  width: number,
  height: number
): Promise<ShippingResponse> {
  try {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";

    if (!token) {
      console.log("⚠️ MELHOR_ENVIO_TOKEN não configurado");
      return { success: false, options: [], error: "Token não configurado" };
    }

    const baseUrl = isSandbox
      ? "https://sandbox.melhorenvio.com.br/api/v2"
      : "https://www.melhorenvio.com.br/api/v2";

    console.log(
      `🚚 Melhor Envio: Calculando frete de ${originCep} para ${destinationCep}`
    );

    const response = await fetch(`${baseUrl}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "RIESCADESASS (riescade@gmail.com)",
      },
      body: JSON.stringify({
        from: {
          postal_code: originCep,
        },
        to: {
          postal_code: destinationCep,
        },
        products: [
          {
            id: "hd-switch-1tb",
            width: width,
            height: height,
            length: length,
            weight: weight,
            insurance_value: 350.0, // Valor do produto em reais
            quantity: 1,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        `❌ Melhor Envio: HTTP ${response.status} - ${response.statusText}`
      );
      console.log(`❌ Melhor Envio: ${errorText}`);
      return { success: false, options: [], error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    console.log(
      "📦 Resposta completa da Melhor Envio:",
      JSON.stringify(data, null, 2)
    );

    // Verificar se os dados estão aninhados em alguma propriedade
    let shippingData = data;
    if (data.data && Array.isArray(data.data)) {
      shippingData = data.data;
      console.log("📦 Dados encontrados em data.data");
    } else if (data.shipping && Array.isArray(data.shipping)) {
      shippingData = data.shipping;
      console.log("📦 Dados encontrados em data.shipping");
    } else if (data.options && Array.isArray(data.options)) {
      shippingData = data.options;
      console.log("📦 Dados encontrados em data.options");
    } else if (data.services && Array.isArray(data.services)) {
      shippingData = data.services;
      console.log("📦 Dados encontrados em data.services");
    }

    const options: ShippingOption[] = [];

    // Processar cada opção de frete
    const processedServices = new Set(); // Para evitar duplicatas

    for (const option of shippingData) {
      console.log(
        "🔍 Opção recebida da Melhor Envio:",
        JSON.stringify(option, null, 2)
      );

      // Verificar se a opção tem os campos necessários
      if (!option || typeof option !== "object") {
        console.log("⚠️ Opção inválida, pulando...");
        continue;
      }

      // Tentar diferentes formatos de preço
      let price = 0;
      if (typeof option.price === "number") {
        price = option.price;
      } else if (typeof option.price === "string") {
        price = parseFloat(option.price);
      } else if (typeof option.cost === "number") {
        price = option.cost;
      } else if (typeof option.cost === "string") {
        price = parseFloat(option.cost);
      } else if (typeof option.value === "number") {
        price = option.value;
      } else if (typeof option.value === "string") {
        price = parseFloat(option.value);
      }

      // Tentar diferentes formatos de tempo de entrega
      let deliveryTime = 0;
      if (typeof option.delivery_time === "number") {
        deliveryTime = option.delivery_time;
      } else if (typeof option.delivery_time === "string") {
        deliveryTime = parseInt(option.delivery_time);
      } else if (typeof option.delivery_time_days === "number") {
        deliveryTime = option.delivery_time_days;
      } else if (typeof option.delivery_time_days === "string") {
        deliveryTime = parseInt(option.delivery_time_days);
      } else if (typeof option.days === "number") {
        deliveryTime = option.days;
      } else if (typeof option.days === "string") {
        deliveryTime = parseInt(option.days);
      }

      // Tentar diferentes formatos de ID do serviço
      let serviceId = null;
      if (option.id !== undefined) {
        serviceId = option.id;
      } else if (option.service_id !== undefined) {
        serviceId = option.service_id;
      } else if (option.service !== undefined) {
        serviceId = option.service;
      } else if (option.code !== undefined) {
        serviceId = option.code;
      }

      console.log(
        `🔍 Valores extraídos - preço: ${price}, tempo: ${deliveryTime}, id: ${serviceId}`
      );

      if (price > 0 && deliveryTime > 0 && serviceId !== null) {
        // Simplificar para apenas SEDEX e PAC
        let serviceName = "Outro";
        if (
          serviceId.toString().includes("2") ||
          serviceId.toString().includes("sedex") ||
          serviceId.toString().includes("SEDEX")
        ) {
          serviceName = "SEDEX";
        } else if (
          serviceId.toString().includes("1") ||
          serviceId.toString().includes("pac") ||
          serviceId.toString().includes("PAC")
        ) {
          serviceName = "PAC";
        }

        // Só adicionar se for SEDEX ou PAC e ainda não foi processado
        if (
          (serviceName === "SEDEX" || serviceName === "PAC") &&
          !processedServices.has(serviceName)
        ) {
          processedServices.add(serviceName); // Marcar como processado

          options.push({
            service: serviceId.toString(),
            serviceName: serviceName,
            shippingValue: Math.round(price * 100), // Converter para centavos
            shippingDays: deliveryTime,
          });

          console.log(
            `✅ Melhor Envio ${serviceName}: R$ ${price.toFixed(2)} - ${deliveryTime} dias`
          );
        } else if (processedServices.has(serviceName)) {
          console.log(
            `⚠️ ${serviceName} já foi processado, ignorando duplicata`
          );
        } else {
          console.log(
            `⚠️ Serviço ignorado (não é SEDEX nem PAC): ${serviceName}`
          );
        }
      } else {
        console.log(
          `⚠️ Opção ignorada - preço: ${price}, tempo: ${deliveryTime}, id: ${serviceId}`
        );
      }
    }

    if (options.length > 0) {
      console.log(
        `✅ ${options.length} opção(ões) de frete calculada(s) via Melhor Envio`
      );
      return {
        success: true,
        options: options,
      };
    }

    console.log("❌ Nenhuma opção válida encontrada na Melhor Envio");
    return {
      success: false,
      options: [],
      error: "Nenhuma opção válida encontrada",
    };
  } catch (error) {
    console.error("❌ Erro na API Melhor Envio:", error);
    return {
      success: false,
      options: [],
      error: "Erro na API Melhor Envio",
    };
  }
}
