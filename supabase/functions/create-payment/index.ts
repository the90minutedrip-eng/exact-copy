import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  productName: string;
  amount: number;
  size: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('INSTAMOJO_API_KEY');
    const authToken = Deno.env.get('INSTAMOJO_AUTH_TOKEN');
    const baseUrl = Deno.env.get('INSTAMOJO_BASE_URL') || 'https://www.instamojo.com';

    if (!apiKey || !authToken) {
      console.error('Missing Instamojo API credentials');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PaymentRequest = await req.json();
    console.log('Payment request received:', body);

    // Validate required fields
    if (!body.productName || !body.amount || !body.size || !body.buyerName || !body.buyerEmail || !body.buyerPhone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    if (body.amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(body.buyerPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.buyerEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const redirectUrl = `${req.headers.get('origin')}/payment-status`;
    
    const purpose = `${body.productName} - Size: ${body.size}`.slice(0, 30);
    
    const formData = new URLSearchParams();
    formData.append('purpose', purpose);
    formData.append('amount', body.amount.toString());
    formData.append('buyer_name', body.buyerName.slice(0, 20));
    formData.append('email', body.buyerEmail);
    formData.append('phone', body.buyerPhone);
    formData.append('redirect_url', redirectUrl);
    formData.append('allow_repeated_payments', 'false');

    console.log('Creating payment request with Instamojo:', {
      purpose,
      amount: body.amount,
      buyer_name: body.buyerName,
      email: body.buyerEmail,
      phone: body.buyerPhone,
      redirect_url: redirectUrl
    });

    const response = await fetch(`${baseUrl}/api/1.1/payment-requests/`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'X-Auth-Token': authToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log('Instamojo response:', data);

    if (!response.ok || !data.success) {
      console.error('Instamojo API error:', data);
      return new Response(
        JSON.stringify({ 
          error: data.message || 'Failed to create payment request',
          details: data 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: data.payment_request.longurl,
        paymentRequestId: data.payment_request.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-payment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
