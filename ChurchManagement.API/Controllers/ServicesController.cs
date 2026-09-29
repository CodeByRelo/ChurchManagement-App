using ChurchManagement.API.DTOs.Services;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly ChurchServiceService _service;

    public ServicesController(
        ChurchServiceService service)
    {
        _service = service;
    }

    // GET: api/Services
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var services = await _service.GetAllAsync();

        return Ok(services);
    }

    // GET: api/Services/5
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var service = await _service.GetByIdAsync(id);

        if (service == null)
        {
            return NotFound(new
            {
                message = "Church service not found."
            });
        }

        return Ok(service);
    }

    // POST: api/Services
    [HttpPost]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Create(
        [FromBody] CreateServiceRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var service =
            await _service.CreateAsync(request);

        if (service == null)
        {
            return BadRequest(new
            {
                message =
                    "Church information must be configured before adding a service."
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = service.ServiceId },
            service);
    }

    // PUT: api/Services/5
    [HttpPut("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateServiceRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var service =
            await _service.UpdateAsync(id, request);

        if (service == null)
        {
            return NotFound(new
            {
                message = "Church service not found."
            });
        }

        return Ok(service);
    }

    // DELETE: api/Services/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted =
            await _service.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Church service not found."
            });
        }

        return NoContent();
    }
}